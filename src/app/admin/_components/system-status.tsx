import { systemChecks, type CheckState } from "~/lib/server/system";

const DOT: Record<CheckState, string> = {
  ok: "bg-[var(--green)]",
  warn: "bg-[var(--warn)]",
  error: "bg-[var(--danger)]",
  off: "border border-[var(--fg-3)]",
};
const WORD: Record<CheckState, string> = { ok: "Working", warn: "Needs a look", error: "Broken", off: "Off" };

/** The Overview's "System" list: each integration, whether it's set up, and whether it answers. */
export async function SystemStatus() {
  const checks = await systemChecks();
  const problems = checks.filter((c) => c.state === "error" || c.state === "warn").length;
  return (
    <section aria-labelledby="sys-h">
      <div className="mb-2 flex items-baseline justify-between">
        <h2 id="sys-h" className="text-[13px] font-medium text-[var(--fg)]">
          System
        </h2>
        <span className={`text-[11px] ${problems ? "text-[var(--danger)]" : "text-[var(--fg-3)]"}`}>{problems ? `${problems} to fix` : "All good"}</span>
      </div>
      <ul className="divide-y divide-[var(--line)] overflow-hidden rounded-xl border border-[var(--line)]">
        {checks.map((c) => (
          <li key={c.id} className="flex gap-3 px-4 py-2.5">
            <span className={`mt-[5px] h-2 w-2 shrink-0 rounded-full ${DOT[c.state]}`} aria-hidden="true" />
            <div className="min-w-0 flex-1">
              <p className="flex items-baseline justify-between gap-2 text-[13px] text-[var(--fg)]">
                {c.label}
                <span className="sr-only">: </span>
                <span className={`shrink-0 text-[11px] ${c.state === "error" ? "text-[var(--danger)]" : "text-[var(--fg-3)]"}`}>{WORD[c.state]}</span>
              </p>
              <p className="mt-0.5 text-[12px] leading-relaxed break-words text-[var(--fg-3)]">{c.detail}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function SystemStatusLoading() {
  return (
    <section aria-label="System" aria-busy="true">
      <h2 className="mb-2 text-[13px] font-medium text-[var(--fg)]">System</h2>
      <div className="rounded-xl border border-[var(--line)] px-4 py-5 text-[12px] text-[var(--fg-3)]">Checking services…</div>
    </section>
  );
}
