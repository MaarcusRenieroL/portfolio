import { requireAdmin } from "~/lib/server/session";
import { KeyRound, LogOut, Monitor, ShieldCheck, Smartphone } from "lucide-react";
import { query } from "~/lib/server/db";
import { signOutEverywhere } from "../../actions";
import { PageHeader } from "../../_components/admin-ui";

export const metadata = { title: "Security" };

const fmt = (d: Date) => d.toLocaleString("en", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });

function ago(d: Date): string {
  const s = (Date.now() - d.getTime()) / 1000;
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

/** "Chrome on macOS" from a user-agent string; good enough to tell your own devices apart. */
function device(ua: string | null): { name: string; phone: boolean } {
  if (!ua) return { name: "Unknown device", phone: false };
  const browser = /Edg\//.test(ua) ? "Edge" : /Firefox\//.test(ua) ? "Firefox" : /Chrome\//.test(ua) ? "Chrome" : /Safari\//.test(ua) ? "Safari" : "Browser";
  const os = /iPhone|iPad/.test(ua) ? "iOS" : /Android/.test(ua) ? "Android" : /Mac OS X/.test(ua) ? "macOS" : /Windows/.test(ua) ? "Windows" : /Linux/.test(ua) ? "Linux" : "";
  return { name: os ? `${browser} on ${os}` : browser, phone: /iPhone|Android|Mobile/.test(ua) };
}

const EVENT_LABELS: Record<string, string> = {
  login_start: "Sign-in started",
  login_magic_ok: "Magic link opened",
  login_passkey_ok: "Signed in with passkey",
  login_ok: "Signed in",
  login_recovery_used: "Signed in with a recovery code",
  setup_start: "Setup started",
  setup_magic_ok: "Setup link opened",
  setup_passkey_ok: "Passkey added",
  setup_complete: "Setup finished",
  login_fail: "Sign-in failed",
  setup_fail: "Setup step failed",
  sessions_revoked: "Signed out everywhere",
  media_upload: "File uploaded",
  media_delete: "File deleted",
};

function Section({ title, aside, children }: { title: string; aside?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section aria-label={title}>
      <div className="mb-2 flex items-center justify-between gap-3">
        <h2 className="text-[13px] font-medium text-[var(--fg)]">{title}</h2>
        {aside}
      </div>
      {children}
    </section>
  );
}

export default async function Security() {
  // Each page checks on its own: a layout check alone does not stop this segment from rendering.
  await requireAdmin();
  const [sessions, keys, codes, log] = await Promise.all([
    query<{ created_at: Date; last_seen_at: Date; ua: string | null }>("select created_at, last_seen_at, ua from admin_session where expires_at > now() order by last_seen_at desc"),
    query<{ label: string; created_at: Date; last_used_at: Date | null }>("select label, created_at, last_used_at from admin_passkey order by created_at"),
    query<{ left: number; total: number }>('select count(*) filter (where used_at is null)::int "left", count(*)::int total from admin_recovery_code'),
    query<{ at: Date; event: string; ip_hash: string | null }>("select at, event, ip_hash from audit_log order by at desc limit 50"),
  ]);
  const left = codes.rows[0]?.left ?? 0;
  const total = codes.rows[0]?.total ?? 0;
  const failures = log.rows.filter((l) => l.event.endsWith("_fail") && Date.now() - l.at.getTime() < 7 * 86400_000).length;

  const rowCls = "flex items-center gap-3 px-4 py-3";
  return (
    <div className="mx-auto w-full max-w-4xl">
      <PageHeader title="Security" description="Sign-in is a magic link, then your passkey or authenticator code. Only you have an account." />

      <div className="space-y-8">
        <section aria-label="Summary" className="grid grid-cols-3 overflow-hidden rounded-xl border border-[var(--line)]">
          {[
            ["Passkeys", keys.rows.length, null],
            ["Recovery codes left", `${left}/${total}`, left <= 2 ? "Running low. Sign in with one and set up new ones." : null],
            ["Failed sign-ins, 7 days", failures, failures > 0 ? "See the log below." : null],
          ].map(([label, value, note], i) => (
            <div key={String(label)} className={`px-4 py-4 sm:px-5 ${i ? "border-l border-[var(--line)]" : ""}`}>
              <p className="text-[12px] text-[var(--fg-3)]">{label}</p>
              <p className="mt-1 font-mono text-xl tabular-nums text-[var(--fg)]">{value}</p>
              {note && <p className="mt-0.5 text-[11px] text-[var(--danger)]">{note}</p>}
            </div>
          ))}
        </section>

        <Section
          title={`Signed-in devices (${sessions.rows.length})`}
          aside={
            <form action={signOutEverywhere}>
              <button
                type="submit"
                className="inline-flex h-8 items-center gap-1.5 rounded-md border border-[var(--danger)]/40 px-3 text-[12px] text-[var(--danger)] transition-colors hover:bg-[var(--danger)]/10 pointer-coarse:h-10"
              >
                <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
                Sign out everywhere
              </button>
            </form>
          }
        >
          <ul className="divide-y divide-[var(--line)] overflow-hidden rounded-xl border border-[var(--line)]">
            {sessions.rows.map((s, i) => {
              const d = device(s.ua);
              const Icon = d.phone ? Smartphone : Monitor;
              return (
                <li key={i} className={rowCls}>
                  <Icon className="h-4 w-4 shrink-0 text-[var(--fg-3)]" aria-hidden="true" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13px] text-[var(--fg)]">{d.name}</span>
                    <span className="block text-[12px] text-[var(--fg-3)]">Signed in {fmt(s.created_at)}</span>
                  </span>
                  <span className="text-[12px] text-[var(--fg-3)]">{ago(s.last_seen_at)}</span>
                </li>
              );
            })}
          </ul>
        </Section>

        <Section title="Passkeys">
          {keys.rows.length === 0 ? (
            <p className="rounded-xl border border-[var(--line)] px-4 py-5 text-[13px] text-[var(--fg-3)]">No passkeys. You sign in with your authenticator app.</p>
          ) : (
            <ul className="divide-y divide-[var(--line)] overflow-hidden rounded-xl border border-[var(--line)]">
              {keys.rows.map((k) => (
                <li key={`${k.label}-${k.created_at.toISOString()}`} className={rowCls}>
                  <KeyRound className="h-4 w-4 shrink-0 text-[var(--fg-3)]" aria-hidden="true" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13px] text-[var(--fg)]">{k.label}</span>
                    <span className="block text-[12px] text-[var(--fg-3)]">Added {fmt(k.created_at)}</span>
                  </span>
                  <span className="text-[12px] text-[var(--fg-3)]">{k.last_used_at ? `Used ${ago(k.last_used_at)}` : "Never used"}</span>
                </li>
              ))}
            </ul>
          )}
        </Section>

        <Section title="Activity">
          {log.rows.length === 0 ? (
            <p className="rounded-xl border border-[var(--line)] px-4 py-5 text-[13px] text-[var(--fg-3)]">Nothing logged yet.</p>
          ) : (
            <div className="overflow-hidden rounded-xl border border-[var(--line)]">
              <table className="w-full text-[13px]">
                <thead className="border-b border-[var(--line)] bg-[var(--hover)]/40 text-left text-[11px] text-[var(--fg-3)]">
                  <tr>
                    <th className="px-4 py-2 font-normal">Event</th>
                    <th className="px-4 py-2 font-normal">When</th>
                    <th className="hidden px-4 py-2 font-normal sm:table-cell">Source</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--line)]">
                  {log.rows.map((l, i) => {
                    const failed = l.event.endsWith("_fail");
                    return (
                      <tr key={i}>
                        <td className="px-4 py-2.5">
                          <span className={`inline-flex items-center gap-2 ${failed ? "text-[var(--danger)]" : "text-[var(--fg)]"}`}>
                            {!failed && (l.event === "login_ok" || l.event === "login_passkey_ok") && <ShieldCheck className="h-3.5 w-3.5 text-[var(--green)]" aria-hidden="true" />}
                            {EVENT_LABELS[l.event] ?? l.event.replace(/_/g, " ")}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-4 py-2.5 text-[12px] text-[var(--fg-3)]">{fmt(l.at)}</td>
                        <td className="hidden px-4 py-2.5 font-mono text-[11px] text-[var(--fg-3)] sm:table-cell">{l.ip_hash ? l.ip_hash.slice(0, 10) : "—"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Section>
      </div>
    </div>
  );
}
