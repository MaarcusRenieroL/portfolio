"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import type { Row } from "~/lib/server/store";
import { ListTools, RowControls } from "./row-controls";
import { SkillRowChips } from "./skills-manager";

const same = (a: unknown, b: unknown) => JSON.stringify(a ?? null) === JSON.stringify(b ?? null);

function getStatus(r: Row): [string, "live" | "draft" | "removed"] {
  if (r.deleted) return ["removed", "removed"];
  if (!r.published) return ["never published", "draft"];
  if (!same(r.draft, r.published) || !same(r.draft_de, r.published_de)) return ["unpublished changes", "draft"];
  return ["live", "live"];
}

export function CmsTable({
  kind,
  titleField,
  label,
  plural,
  rows,
  pending,
}: {
  kind: string;
  titleField: string;
  label: string;
  plural: string;
  rows: Row[];
  pending: boolean;
}) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "live" | "draft">("all");

  const liveCount = useMemo(() => rows.filter((r) => !r.deleted && getStatus(r)[1] === "live").length, [rows]);
  const draftCount = useMemo(() => rows.filter((r) => !r.deleted && getStatus(r)[1] === "draft").length, [rows]);

  const filteredRows = useMemo(() => {
    return rows.filter((r) => {
      const title = String(r.draft[titleField] ?? r.key).toLowerCase();
      const key = r.key.toLowerCase();
      const q = search.trim().toLowerCase();

      if (q && !title.includes(q) && !key.includes(q)) return false;

      const [, cls] = getStatus(r);
      if (statusFilter === "live" && cls !== "live") return false;
      if (statusFilter === "draft" && cls !== "draft") return false;

      return true;
    });
  }, [rows, titleField, search, statusFilter]);

  if (rows.length === 0) {
    return (
      <div className="tablecn-empty-card">
        <p className="muted" style={{ margin: 0 }}>Nothing here yet.</p>
        <p className="muted small" style={{ margin: "6px 0 16px" }}>
          Import the default site data or create your first {label.toLowerCase()}.
        </p>
        <div className="row" style={{ justifyContent: "center" }}>
          <ListTools kind={kind} empty={true} pending={false} />
          <Link className="btn" href={`/admin/content/${kind}/new`}>
            + Create first {label.toLowerCase()}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="tablecn-wrap">
      {/* TableCN Advanced Filter & Search Toolbar */}
      <div className="tablecn-toolbar">
        <div className="tablecn-toolbar-left">
          {/* Search box */}
          <div className="tablecn-search-box">
            <svg
              className="tablecn-search-icon"
              width={14}
              height={14}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={`Filter by title or key...`}
              className="tablecn-search-input"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="tablecn-clear-btn"
                title="Clear search"
              >
                ×
              </button>
            )}
          </div>

          {/* Faceted Filter Tabs */}
          <div className="tablecn-tabs">
            <button
              type="button"
              className={`tablecn-tab ${statusFilter === "all" ? "active" : ""}`}
              onClick={() => setStatusFilter("all")}
            >
              All <span className="tablecn-tab-count">{rows.length}</span>
            </button>
            <button
              type="button"
              className={`tablecn-tab ${statusFilter === "live" ? "active" : ""}`}
              onClick={() => setStatusFilter("live")}
            >
              Live <span className="tablecn-tab-count">{liveCount}</span>
            </button>
            {draftCount > 0 && (
              <button
                type="button"
                className={`tablecn-tab ${statusFilter === "draft" ? "active" : ""}`}
                onClick={() => setStatusFilter("draft")}
              >
                Drafts <span className="tablecn-tab-count">{draftCount}</span>
              </button>
            )}
          </div>
        </div>

        {/* Right side actions */}
        <div className="tablecn-toolbar-right">
          <ListTools kind={kind} empty={false} pending={pending} />
        </div>
      </div>

      {/* Semantic, Pixel-Aligned Data Table */}
      <div className="tablecn-box">
        <table className="tablecn-table">
          <thead>
            <tr>
              <th className="tablecn-th-title">Title & Key</th>
              <th className="tablecn-th-status">Status</th>
              <th className="tablecn-th-locale">Locale</th>
              <th className="tablecn-th-order">Reorder</th>
              <th className="tablecn-th-action">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredRows.map((r, i) => {
              const [label, cls] = getStatus(r);
              return (
                <tr key={r.key} className="tablecn-row item">
                  <td className="tablecn-td-title">
                    <Link
                      href={`/admin/content/${kind}/${encodeURIComponent(r.key)}`}
                      className="tablecn-row-title-link"
                    >
                      <strong>{String(r.draft[titleField] ?? r.key)}</strong>
                      <span className="tablecn-row-key">{r.key}</span>
                    </Link>

                    {kind === "skillgroup" && Array.isArray((r.draft as Record<string, unknown>).items) && (
                      <SkillRowChips
                        groupName={r.key}
                        items={(r.draft as Record<string, unknown>).items as string[]}
                        allGroups={rows.map((row) => row.key)}
                      />
                    )}
                  </td>

                  <td className="tablecn-td-status">
                    <span className={`pill ${cls}`}>
                      <span className={`tablecn-dot ${cls}`} />
                      {label}
                    </span>
                  </td>

                  <td className="tablecn-td-locale">
                    {r.de_machine && r.draft_de ? (
                      <span className="pill" title="Machine translated German">DE (machine)</span>
                    ) : r.draft_de && Object.keys(r.draft_de).length > 0 ? (
                      <span className="pill live" title="German translation verified">DE</span>
                    ) : (
                      <span className="tablecn-locale-none">EN only</span>
                    )}
                  </td>

                  <td className="tablecn-td-order">
                    <RowControls kind={kind} k={r.key} first={i === 0} last={i === rows.length - 1} />
                  </td>

                  <td className="tablecn-td-action">
                    <Link
                      href={`/admin/content/${kind}/${encodeURIComponent(r.key)}`}
                      className="tablecn-edit-link"
                    >
                      Edit →
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {filteredRows.length === 0 && (
          <div className="tablecn-no-results">
            <p className="muted small">No items match your filter.</p>
            <button
              type="button"
              className="ghost"
              style={{ marginTop: 8 }}
              onClick={() => {
                setSearch("");
                setStatusFilter("all");
              }}
            >
              Reset filters
            </button>
          </div>
        )}
      </div>

      {/* TableCN Footer info */}
      <div className="tablecn-footer">
        <span className="tablecn-count">
          Showing {filteredRows.length} of {rows.length} {rows.length === 1 ? "entry" : "entries"}
        </span>
      </div>
    </div>
  );
}
