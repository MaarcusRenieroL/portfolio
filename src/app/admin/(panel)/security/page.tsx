import { query } from "~/lib/server/db";
import {
  KeyIcon,
  ShieldIcon,
  ClockIcon,
} from "../../_components/icons";
import { SecurityTable } from "../../_components/security-table";

export const metadata = { title: "Security" };

export default async function Security() {
  const [sessions, keys, codes, log] = await Promise.all([
    query<{
      created_at: Date;
      last_seen_at: Date;
      expires_at: Date;
      ua: string | null;
    }>(
      "select created_at, last_seen_at, expires_at, ua from admin_session where expires_at > now() order by created_at desc"
    ),
    query<{ label: string; created_at: Date; last_used_at: Date | null }>(
      "select label, created_at, last_used_at from admin_passkey order by created_at"
    ),
    query<{ left: string; total: string }>(
      'select count(*) filter (where used_at is null) "left", count(*) total from admin_recovery_code'
    ),
    query<{ at: Date; event: string; ip_hash: string | null }>(
      "select at, event, ip_hash from audit_log order by at desc limit 50"
    ),
  ]);

  const unusedCodes = Number(codes.rows[0]?.left ?? 0);
  const totalCodes = Number(codes.rows[0]?.total ?? 0);

  const serializedSessions = sessions.rows.map((s) => ({
    created_at: s.created_at.toISOString(),
    last_seen_at: s.last_seen_at.toISOString(),
    expires_at: s.expires_at.toISOString(),
    ua: s.ua,
  }));

  const serializedKeys = keys.rows.map((k) => ({
    label: k.label,
    created_at: k.created_at.toISOString(),
    last_used_at: k.last_used_at ? k.last_used_at.toISOString() : null,
  }));

  const serializedLog = log.rows.map((l) => ({
    at: l.at.toISOString(),
    event: l.event,
    ip_hash: l.ip_hash,
  }));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
      {/* Page Header */}
      <div className="admin-section-header">
        <div>
          <h1>Security</h1>
          <p>
            Zero-trust authentication: WebAuthn hardware passkeys, one-time magic links, TOTP codes, and security audit log.
          </p>
        </div>
      </div>

      {/* Security Stat Cards */}
      <section className="admin-grid">
        <div className="admin-stat-card">
          <div className="admin-card-head">
            <span className="admin-card-title">
              <KeyIcon width={15} height={15} className="admin-card-icon" />
              Passkeys
            </span>
            <span className="pill live">WebAuthn</span>
          </div>
          <div className="admin-card-body">
            <span className="n">{keys.rows.length}</span>
            <span className="admin-card-action">Hardware credentials</span>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-card-head">
            <span className="admin-card-title">
              <ShieldIcon width={15} height={15} className="admin-card-icon" />
              Recovery Codes
            </span>
            <span className={`pill ${unusedCodes > 2 ? "live" : "draft"}`}>
              {unusedCodes} left
            </span>
          </div>
          <div className="admin-card-body">
            <span className="n">{unusedCodes}</span>
            <span className="admin-card-action">of {totalCodes} available</span>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-card-head">
            <span className="admin-card-title">
              <ClockIcon width={15} height={15} className="admin-card-icon" />
              Active Sessions
            </span>
            <span className="pill live">Live</span>
          </div>
          <div className="admin-card-body">
            <span className="n">{sessions.rows.length}</span>
            <span className="admin-card-action">Authenticated devices</span>
          </div>
        </div>
      </section>

      {/* TableCN Security Data Table */}
      <section style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div className="admin-subheading">
          <h2>Access & Audit Log</h2>
          <span style={{ fontSize: 12, color: "var(--fg-3)", fontFamily: "var(--mono)" }}>
            Real-time audit log, active sessions, and hardware passkeys
          </span>
        </div>

        <SecurityTable
          sessions={serializedSessions}
          keys={serializedKeys}
          unusedCodes={unusedCodes}
          totalCodes={totalCodes}
          auditLog={serializedLog}
        />
      </section>
    </div>
  );
}
