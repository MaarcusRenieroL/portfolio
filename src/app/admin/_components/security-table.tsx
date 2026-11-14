"use client";

import { useMemo, useState } from "react";
import { signOutEverywhere } from "../actions";
import {
  KeyIcon,
  ShieldIcon,
  ClockIcon,
  LogOutIcon,
  SearchIcon,
  XIcon,
  DeviceDesktopIcon,
  CheckIcon,
} from "./icons";

export interface SecuritySession {
  created_at: string;
  last_seen_at: string;
  expires_at: string;
  ua: string | null;
}

export interface SecurityPasskey {
  label: string;
  created_at: string;
  last_used_at: string | null;
}

export interface SecurityAuditEntry {
  at: string;
  event: string;
  ip_hash: string | null;
}

interface SecurityTableProps {
  sessions: SecuritySession[];
  keys: SecurityPasskey[];
  unusedCodes: number;
  totalCodes: number;
  auditLog: SecurityAuditEntry[];
}

export function SecurityTable({
  sessions,
  keys,
  unusedCodes,
  totalCodes,
  auditLog,
}: SecurityTableProps) {
  const [activeTab, setActiveTab] = useState<"log" | "sessions" | "passkeys" | "recovery">("log");
  const [search, setSearch] = useState("");
  const [eventCategory, setEventCategory] = useState<"all" | "login" | "setup" | "other">("all");

  // Format UTC dates nicely
  const formatDate = (iso: string | null) => {
    if (!iso) return "never";
    const d = new Date(iso);
    return isNaN(d.getTime()) ? iso : d.toISOString().replace("T", " ").slice(0, 16) + " UTC";
  };

  // Filtered Audit Log
  const filteredLog = useMemo(() => {
    return auditLog.filter((l) => {
      const q = search.trim().toLowerCase();
      if (q && !l.event.toLowerCase().includes(q) && !(l.ip_hash ?? "").toLowerCase().includes(q)) {
        return false;
      }
      if (eventCategory === "login" && !l.event.startsWith("login")) return false;
      if (eventCategory === "setup" && !l.event.startsWith("setup")) return false;
      if (eventCategory === "other" && (l.event.startsWith("login") || l.event.startsWith("setup"))) {
        return false;
      }
      return true;
    });
  }, [auditLog, search, eventCategory]);

  // Filtered Sessions
  const filteredSessions = useMemo(() => {
    return sessions.filter((s) => {
      const q = search.trim().toLowerCase();
      if (q && !(s.ua ?? "").toLowerCase().includes(q)) return false;
      return true;
    });
  }, [sessions, search]);

  // Filtered Passkeys
  const filteredKeys = useMemo(() => {
    return keys.filter((k) => {
      const q = search.trim().toLowerCase();
      if (q && !k.label.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [keys, search]);

  return (
    <div className="tablecn-wrap">
      {/* TableCN Top Control Toolbar */}
      <div className="tablecn-toolbar">
        <div className="tablecn-toolbar-left">
          {/* TableCN View Selector Tabs */}
          <div className="tablecn-tabs" role="tablist" aria-label="Security Views">
            <button
              type="button"
              className={`tablecn-tab ${activeTab === "log" ? "active" : ""}`}
              onClick={() => setActiveTab("log")}
            >
              Audit Log
              <span className="tablecn-tab-count">{auditLog.length}</span>
            </button>
            <button
              type="button"
              className={`tablecn-tab ${activeTab === "sessions" ? "active" : ""}`}
              onClick={() => setActiveTab("sessions")}
            >
              Active Sessions
              <span className="tablecn-tab-count">{sessions.length}</span>
            </button>
            <button
              type="button"
              className={`tablecn-tab ${activeTab === "passkeys" ? "active" : ""}`}
              onClick={() => setActiveTab("passkeys")}
            >
              Passkeys
              <span className="tablecn-tab-count">{keys.length}</span>
            </button>
            <button
              type="button"
              className={`tablecn-tab ${activeTab === "recovery" ? "active" : ""}`}
              onClick={() => setActiveTab("recovery")}
            >
              Recovery Codes
              <span className="tablecn-tab-count">{unusedCodes}/{totalCodes}</span>
            </button>
          </div>

          {/* Real-time search box */}
          {activeTab !== "recovery" && (
            <div className="tablecn-search-box" style={{ minWidth: 260 }}>
              <SearchIcon width={14} height={14} className="tablecn-search-icon" />
              <input
                type="text"
                className="tablecn-search-input"
                placeholder={
                  activeTab === "log"
                    ? "Filter events or IP hashes..."
                    : activeTab === "sessions"
                    ? "Filter by user agent or device..."
                    : "Filter passkeys by label..."
                }
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button
                  type="button"
                  className="tablecn-clear-btn"
                  onClick={() => setSearch("")}
                  title="Clear search"
                >
                  <XIcon width={13} height={13} />
                </button>
              )}
            </div>
          )}

          {/* Audit Event Filter Pills */}
          {activeTab === "log" && (
            <div className="tablecn-tabs" style={{ background: "transparent", border: "none" }}>
              <button
                type="button"
                className={`tablecn-tab ${eventCategory === "all" ? "active" : ""}`}
                onClick={() => setEventCategory("all")}
              >
                All
              </button>
              <button
                type="button"
                className={`tablecn-tab ${eventCategory === "login" ? "active" : ""}`}
                onClick={() => setEventCategory("login")}
              >
                Logins
              </button>
              <button
                type="button"
                className={`tablecn-tab ${eventCategory === "setup" ? "active" : ""}`}
                onClick={() => setEventCategory("setup")}
              >
                Setup
              </button>
              <button
                type="button"
                className={`tablecn-tab ${eventCategory === "other" ? "active" : ""}`}
                onClick={() => setEventCategory("other")}
              >
                Other
              </button>
            </div>
          )}
        </div>

        {/* Top Right Action: Sign Out Everywhere */}
        {activeTab === "sessions" && (
          <form action={signOutEverywhere}>
            <button
              className="btn danger"
              type="submit"
              style={{
                fontSize: 12,
                padding: "6px 14px",
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <LogOutIcon width={13} height={13} />
              Sign out everywhere
            </button>
          </form>
        )}
      </div>

      {/* Main TableCN Table Box */}
      <div className="tablecn-box">
        {/* TAB 1: AUDIT LOG DATA TABLE */}
        {activeTab === "log" && (
          <>
            {filteredLog.length === 0 ? (
              <div className="tablecn-no-results">
                <p className="muted" style={{ margin: 0 }}>
                  {search ? `No audit events matching "${search}".` : "No audit activity recorded yet."}
                </p>
                {search && (
                  <button
                    type="button"
                    className="tablecn-filter-reset"
                    style={{ marginTop: 8 }}
                    onClick={() => setSearch("")}
                  >
                    Clear search filter
                  </button>
                )}
              </div>
            ) : (
              <table className="tablecn-table">
                <thead>
                  <tr>
                    <th style={{ width: 44 }}>#</th>
                    <th style={{ width: 220 }}>Security Event</th>
                    <th>Timestamp (UTC)</th>
                    <th style={{ width: 140 }}>State</th>
                    <th style={{ width: 120, textAlign: "right" }}>IP Hash</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLog.map((l, i) => {
                    const isSuccess = l.event.endsWith("_ok") || l.event.endsWith("_complete");
                    const isFail = l.event.includes("failed") || l.event.includes("error");
                    return (
                      <tr className="tablecn-row" key={i}>
                        <td style={{ color: "var(--fg-3)", fontFamily: "var(--mono)", fontSize: 12 }}>
                          {i + 1}
                        </td>
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <span
                              className={`tablecn-dot ${
                                isSuccess ? "live" : isFail ? "danger" : "draft"
                              }`}
                              style={{
                                background: isSuccess
                                  ? "var(--green)"
                                  : isFail
                                  ? "var(--danger)"
                                  : "var(--warn)",
                              }}
                            />
                            <code style={{ fontSize: 12.5, fontWeight: 500 }}>{l.event}</code>
                          </div>
                        </td>
                        <td style={{ color: "var(--fg-2)", fontFamily: "var(--mono)", fontSize: 12 }}>
                          {formatDate(l.at)}
                        </td>
                        <td>
                          <span
                            className={`pill ${isSuccess ? "live" : isFail ? "danger" : ""}`}
                            style={{
                              fontSize: 10.5,
                              padding: "2px 8px",
                              color: isFail ? "var(--danger)" : undefined,
                              borderColor: isFail ? "var(--danger)" : undefined,
                            }}
                          >
                            {isSuccess ? "verified" : isFail ? "failed" : "attempted"}
                          </span>
                        </td>
                        <td style={{ textAlign: "right" }}>
                          <code style={{ fontSize: 11 }}>{l.ip_hash?.slice(0, 8) ?? "—"}</code>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
            <div className="tablecn-footer">
              Showing {filteredLog.length} of {auditLog.length} audit entries
            </div>
          </>
        )}

        {/* TAB 2: ACTIVE SESSIONS DATA TABLE */}
        {activeTab === "sessions" && (
          <>
            {filteredSessions.length === 0 ? (
              <div className="tablecn-no-results">
                <p className="muted" style={{ margin: 0 }}>
                  {search ? `No active sessions matching "${search}".` : "No active sessions."}
                </p>
              </div>
            ) : (
              <table className="tablecn-table">
                <thead>
                  <tr>
                    <th style={{ width: 44 }}>#</th>
                    <th>Device & Client User-Agent</th>
                    <th style={{ width: 170 }}>Session Started</th>
                    <th style={{ width: 170 }}>Last Activity</th>
                    <th style={{ width: 110, textAlign: "right" }}>Session State</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSessions.map((s, i) => (
                    <tr className="tablecn-row" key={i}>
                      <td style={{ color: "var(--fg-3)", fontFamily: "var(--mono)", fontSize: 12 }}>
                        {i + 1}
                      </td>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <DeviceDesktopIcon width={16} height={16} style={{ color: "var(--green)" }} />
                          <code style={{ fontSize: 12, wordBreak: "break-word" }}>
                            {s.ua ?? "Unknown Client Device"}
                          </code>
                        </div>
                      </td>
                      <td style={{ color: "var(--fg-2)", fontFamily: "var(--mono)", fontSize: 12 }}>
                        {formatDate(s.created_at)}
                      </td>
                      <td style={{ color: "var(--fg-2)", fontFamily: "var(--mono)", fontSize: 12 }}>
                        {formatDate(s.last_seen_at)}
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <span className="pill live" style={{ fontSize: 10.5 }}>
                          active session
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            <div className="tablecn-footer">
              {sessions.length} active session{sessions.length === 1 ? "" : "s"} authenticated
            </div>
          </>
        )}

        {/* TAB 3: PASSKEYS DATA TABLE */}
        {activeTab === "passkeys" && (
          <>
            {filteredKeys.length === 0 ? (
              <div className="tablecn-no-results">
                <p className="muted" style={{ margin: 0 }}>
                  {search ? `No passkeys matching "${search}".` : "No passkeys registered."}
                </p>
              </div>
            ) : (
              <table className="tablecn-table">
                <thead>
                  <tr>
                    <th style={{ width: 44 }}>#</th>
                    <th>Passkey Credential</th>
                    <th style={{ width: 180 }}>Registered At</th>
                    <th style={{ width: 180 }}>Last Used</th>
                    <th style={{ width: 120, textAlign: "right" }}>Authentication</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredKeys.map((k, i) => (
                    <tr className="tablecn-row" key={i}>
                      <td style={{ color: "var(--fg-3)", fontFamily: "var(--mono)", fontSize: 12 }}>
                        {i + 1}
                      </td>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <KeyIcon width={15} height={15} style={{ color: "var(--green)" }} />
                          <strong style={{ fontSize: 13, color: "var(--fg)" }}>{k.label}</strong>
                        </div>
                      </td>
                      <td style={{ color: "var(--fg-2)", fontFamily: "var(--mono)", fontSize: 12 }}>
                        {formatDate(k.created_at)}
                      </td>
                      <td style={{ color: "var(--fg-2)", fontFamily: "var(--mono)", fontSize: 12 }}>
                        {formatDate(k.last_used_at)}
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <span className="pill live" style={{ fontSize: 10.5 }}>
                          WebAuthn
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            <div className="tablecn-footer">
              {keys.length} hardware-backed passkey credential{keys.length === 1 ? "" : "s"}
            </div>
          </>
        )}

        {/* TAB 4: RECOVERY CODES DATA TABLE & SLOTS */}
        {activeTab === "recovery" && (
          <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <strong style={{ fontSize: 14, color: "var(--fg)" }}>
                  Emergency Recovery Access
                </strong>
                <p className="muted small" style={{ margin: "4px 0 0" }}>
                  Each recovery code can bypass WebAuthn authenticator verification exactly once.
                </p>
              </div>
              <span className={`pill ${unusedCodes > 2 ? "live" : "draft"}`}>
                {unusedCodes} of {totalCodes} Available
              </span>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                gap: 12,
                marginTop: 8,
              }}
            >
              {Array.from({ length: totalCodes }).map((_, i) => {
                const isAvailable = i < unusedCodes;
                return (
                  <div
                    key={i}
                    style={{
                      padding: "12px 16px",
                      borderRadius: 6,
                      background: isAvailable ? "var(--hover)" : "transparent",
                      border: "1px solid var(--line-2)",
                      opacity: isAvailable ? 1 : 0.4,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <ShieldIcon
                        width={14}
                        height={14}
                        style={{ color: isAvailable ? "var(--green)" : "var(--fg-3)" }}
                      />
                      <span style={{ fontSize: 12, fontFamily: "var(--mono)", color: "var(--fg)" }}>
                        Code Slot #{i + 1}
                      </span>
                    </div>
                    {isAvailable ? (
                      <span className="pill live" style={{ fontSize: 9.5, padding: "1px 5px" }}>
                        active
                      </span>
                    ) : (
                      <span className="pill" style={{ fontSize: 9.5, padding: "1px 5px" }}>
                        consumed
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="tablecn-footer" style={{ padding: "8px 0 0" }}>
              Stored hashed with Argon2id. Codes can only be generated or rotated during initial setup.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
