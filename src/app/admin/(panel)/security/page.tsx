import { query } from "~/lib/server/db";
import { signOutEverywhere } from "../../actions";

export const metadata = { title: "Security" };

const when = (d: Date | null) => (d ? d.toISOString().replace("T", " ").slice(0, 16) + " UTC" : "never");

export default async function Security() {
  const [sessions, keys, codes, log] = await Promise.all([
    query<{ created_at: Date; last_seen_at: Date; expires_at: Date; ua: string | null }>("select created_at, last_seen_at, expires_at, ua from admin_session where expires_at > now() order by created_at desc"),
    query<{ label: string; created_at: Date; last_used_at: Date | null }>("select label, created_at, last_used_at from admin_passkey order by created_at"),
    query<{ left: string; total: string }>("select count(*) filter (where used_at is null) \"left\", count(*) total from admin_recovery_code"),
    query<{ at: Date; event: string; ip_hash: string | null }>("select at, event, ip_hash from audit_log order by at desc limit 40"),
  ]);
  return (
    <>
      <h1>Security</h1>
      <p className="muted">Sign-in is your email, a one-time link, a passkey and an authenticator code. Nothing here can be changed without all four.</p>

      <h2>Passkeys</h2>
      <div className="list">
        {keys.rows.map((k, i) => (
          <div className="item" key={i}><span>{k.label}</span><span className="muted">added {when(k.created_at)} · last used {when(k.last_used_at)}</span></div>
        ))}
      </div>

      <h2>Recovery codes</h2>
      <p>{codes.rows[0].left} of {codes.rows[0].total} unused.</p>

      <h2>Active sessions</h2>
      <div className="list">
        {sessions.rows.map((s, i) => (
          <div className="item" key={i}><span>{(s.ua ?? "unknown").slice(0, 70)}</span><span className="muted">started {when(s.created_at)} · active {when(s.last_seen_at)}</span></div>
        ))}
      </div>
      <form action={signOutEverywhere} style={{ marginTop: 12 }}>
        <button className="btn" type="submit">Sign out everywhere</button>
      </form>

      <h2>Recent activity</h2>
      <div className="list">
        {log.rows.map((l, i) => (
          <div className="item" key={i}><span>{l.event}</span><span className="muted">{when(l.at)} · {l.ip_hash?.slice(0, 6) ?? "-"}</span></div>
        ))}
      </div>
    </>
  );
}
