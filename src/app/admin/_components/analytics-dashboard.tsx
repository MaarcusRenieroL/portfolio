"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  BarChartIcon,
  UsersIcon,
  GlobeIcon,
  ShieldIcon,
  ExternalLinkIcon,
  CalendarIcon,
  FilterIcon,
  SearchIcon,
  XIcon,
  ChevronDownIcon,
  CheckIcon,
  SlidersHorizontalIcon,
} from "./icons";

export interface AnalyticsData {
  days: number;
  totals: { views: string; visitors: string };
  pages: Array<{ path: string; n: string }>;
  actions: Array<{ kind: string; n: string }>;
  targets: Array<{ kind: string; target: string; n: string }>;
  daily: Array<{ label: string; n: string }>;
  labels: Record<string, string>;
}

const DATE_PRESETS = [
  { value: 1, label: "Last 24 hours" },
  { value: 7, label: "Last 7 days" },
  { value: 14, label: "Last 14 days" },
  { value: 30, label: "Last 30 days" },
  { value: 90, label: "Last 90 days" },
  { value: 365, label: "All time (1 yr)" },
];

export function AnalyticsDashboard({
  days,
  totals,
  pages,
  actions,
  targets,
  daily,
  labels,
}: AnalyticsData) {
  const router = useRouter();

  // Filter States
  const [search, setSearch] = useState("");
  const [selectedKind, setSelectedKind] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"desc" | "asc" | "alpha">("desc");

  // Popover States
  const [dateOpen, setDateOpen] = useState(false);
  const [eventOpen, setEventOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);

  const dateRef = useRef<HTMLDivElement>(null);
  const eventRef = useRef<HTMLDivElement>(null);
  const sortRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dateRef.current && !dateRef.current.contains(e.target as Node)) {
        setDateOpen(false);
      }
      if (eventRef.current && !eventRef.current.contains(e.target as Node)) {
        setEventOpen(false);
      }
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) {
        setSortOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter & Sort Top Pages
  const filteredPages = useMemo(() => {
    let result = [...pages];
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((p) => p.path.toLowerCase().includes(q));
    }
    if (sortBy === "desc") {
      result.sort((a, b) => Number(b.n) - Number(a.n));
    } else if (sortBy === "asc") {
      result.sort((a, b) => Number(a.n) - Number(b.n));
    } else if (sortBy === "alpha") {
      result.sort((a, b) => a.path.localeCompare(b.path));
    }
    return result;
  }, [pages, search, sortBy]);

  // Filter & Sort Targets / Outbound Clicks
  const filteredTargets = useMemo(() => {
    let result = [...targets];
    if (selectedKind !== "all") {
      result = result.filter((t) => t.kind === selectedKind);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (t) =>
          t.target.toLowerCase().includes(q) ||
          (labels[t.kind] ?? t.kind).toLowerCase().includes(q)
      );
    }
    if (sortBy === "desc") {
      result.sort((a, b) => Number(b.n) - Number(a.n));
    } else if (sortBy === "asc") {
      result.sort((a, b) => Number(a.n) - Number(b.n));
    } else if (sortBy === "alpha") {
      result.sort((a, b) => a.target.localeCompare(b.target));
    }
    return result;
  }, [targets, selectedKind, search, sortBy, labels]);

  // Calculations
  const maxDaily = Math.max(1, ...daily.map((r) => Number(r.n)));
  const totalViewsCount = Math.max(
    1,
    pages.reduce((sum, r) => sum + Number(r.n), 0)
  );

  const currentPreset =
    DATE_PRESETS.find((p) => p.value === days) ?? {
      value: days,
      label: `Last ${days} days`,
    };

  const hasActiveFilters =
    search.trim() !== "" || selectedKind !== "all" || days !== 7;

  function resetAllFilters() {
    setSearch("");
    setSelectedKind("all");
    setSortBy("desc");
    if (days !== 7) {
      router.push("/admin/analytics?days=7");
    }
  }

  // All distinct event types available
  const availableKinds = useMemo(() => {
    const set = new Set<string>();
    actions.forEach((a) => set.add(a.kind));
    targets.forEach((t) => set.add(t.kind));
    return Array.from(set);
  }, [actions, targets]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
      {/* Page Header */}
      <div className="admin-section-header">
        <div>
          <h1>Analytics</h1>
          <p>
            Privacy-first visitor telemetry, route activity, and outbound interactions.
          </p>
        </div>

        {/* Quick Segmented Range Pills (preserved for instant toggle and test contracts) */}
        <div className="tablecn-tabs" role="tablist" aria-label="Time Range">
          <Link
            className={`tablecn-tab ${days === 7 ? "active" : ""}`}
            aria-current={days === 7 ? "page" : undefined}
            href="/admin/analytics?days=7"
            style={{ textDecoration: "none" }}
          >
            7 days
          </Link>
          <Link
            className={`tablecn-tab ${days === 30 ? "active" : ""}`}
            aria-current={days === 30 ? "page" : undefined}
            href="/admin/analytics?days=30"
            style={{ textDecoration: "none" }}
          >
            30 days
          </Link>
        </div>
      </div>

      {/* Advanced Data Filtering Toolbar (TableCN Faceted Filter System) */}
      <div className="tablecn-card" style={{ padding: 14 }}>
        <div className="tablecn-toolbar">
          <div className="tablecn-toolbar-left" style={{ flex: 1 }}>
            {/* Search Route / Target Filter */}
            <div className="tablecn-search-box" style={{ minWidth: 260 }}>
              <SearchIcon
                width={14}
                height={14}
                className="tablecn-search-icon"
              />
              <input
                type="text"
                className="tablecn-search-input"
                placeholder="Filter routes or click targets..."
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

            {/* Date Range Dropdown Popover */}
            <div className="tablecn-filter-group" ref={dateRef}>
              <button
                type="button"
                className={`tablecn-filter-btn ${days !== 7 ? "active" : ""}`}
                onClick={() => setDateOpen(!dateOpen)}
              >
                <CalendarIcon width={13} height={13} />
                <span>{currentPreset.label}</span>
                <ChevronDownIcon width={12} height={12} />
              </button>

              {dateOpen && (
                <div className="tablecn-popover">
                  <div className="tablecn-popover-header">Date Range Presets</div>
                  {DATE_PRESETS.map((p) => (
                    <button
                      key={p.value}
                      type="button"
                      className={`tablecn-popover-item ${
                        days === p.value ? "active" : ""
                      }`}
                      onClick={() => {
                        setDateOpen(false);
                        router.push(`/admin/analytics?days=${p.value}`);
                      }}
                    >
                      <span>{p.label}</span>
                      {days === p.value && <CheckIcon width={13} height={13} />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Event Kind Faceted Filter */}
            <div className="tablecn-filter-group" ref={eventRef}>
              <button
                type="button"
                className={`tablecn-filter-btn ${
                  selectedKind !== "all" ? "active" : ""
                }`}
                onClick={() => setEventOpen(!eventOpen)}
              >
                <FilterIcon width={13} height={13} />
                <span>Event Type</span>
                {selectedKind !== "all" && (
                  <span className="tablecn-filter-count">1</span>
                )}
                <ChevronDownIcon width={12} height={12} />
              </button>

              {eventOpen && (
                <div className="tablecn-popover" style={{ minWidth: 230 }}>
                  <div className="tablecn-popover-header">Faceted Event Filter</div>
                  <button
                    type="button"
                    className={`tablecn-popover-item ${
                      selectedKind === "all" ? "active" : ""
                    }`}
                    onClick={() => {
                      setSelectedKind("all");
                      setEventOpen(false);
                    }}
                  >
                    <span>All Events</span>
                    {selectedKind === "all" && <CheckIcon width={13} height={13} />}
                  </button>
                  {availableKinds.map((k) => (
                    <button
                      key={k}
                      type="button"
                      className={`tablecn-popover-item ${
                        selectedKind === k ? "active" : ""
                      }`}
                      onClick={() => {
                        setSelectedKind(k);
                        setEventOpen(false);
                      }}
                    >
                      <span>{labels[k] ?? k}</span>
                      {selectedKind === k && <CheckIcon width={13} height={13} />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Sort Dropdown */}
            <div className="tablecn-filter-group" ref={sortRef}>
              <button
                type="button"
                className="tablecn-filter-btn"
                onClick={() => setSortOpen(!sortOpen)}
              >
                <SlidersHorizontalIcon width={13} height={13} />
                <span>
                  Sort:{" "}
                  {sortBy === "desc"
                    ? "Views (High-Low)"
                    : sortBy === "asc"
                    ? "Views (Low-High)"
                    : "Alphabetical"}
                </span>
                <ChevronDownIcon width={12} height={12} />
              </button>

              {sortOpen && (
                <div className="tablecn-popover">
                  <div className="tablecn-popover-header">Sort Order</div>
                  <button
                    type="button"
                    className={`tablecn-popover-item ${
                      sortBy === "desc" ? "active" : ""
                    }`}
                    onClick={() => {
                      setSortBy("desc");
                      setSortOpen(false);
                    }}
                  >
                    <span>Most Views (High to Low)</span>
                    {sortBy === "desc" && <CheckIcon width={13} height={13} />}
                  </button>
                  <button
                    type="button"
                    className={`tablecn-popover-item ${
                      sortBy === "asc" ? "active" : ""
                    }`}
                    onClick={() => {
                      setSortBy("asc");
                      setSortOpen(false);
                    }}
                  >
                    <span>Fewest Views (Low to High)</span>
                    {sortBy === "asc" && <CheckIcon width={13} height={13} />}
                  </button>
                  <button
                    type="button"
                    className={`tablecn-popover-item ${
                      sortBy === "alpha" ? "active" : ""
                    }`}
                    onClick={() => {
                      setSortBy("alpha");
                      setSortOpen(false);
                    }}
                  >
                    <span>Alphabetical (A to Z)</span>
                    {sortBy === "alpha" && <CheckIcon width={13} height={13} />}
                  </button>
                </div>
              )}
            </div>
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              className="tablecn-filter-reset"
              onClick={resetAllFilters}
            >
              <XIcon width={12} height={12} /> Reset filters
            </button>
          )}
        </div>

        {/* Active Filter Badges */}
        {hasActiveFilters && (
          <div className="tablecn-active-filters">
            {days !== 7 && (
              <span className="tablecn-filter-tag">
                Range: <strong>{currentPreset.label}</strong>
                <button
                  type="button"
                  className="tablecn-tag-remove"
                  onClick={() => router.push("/admin/analytics?days=7")}
                  title="Reset to 7 days"
                >
                  <XIcon width={11} height={11} />
                </button>
              </span>
            )}

            {selectedKind !== "all" && (
              <span className="tablecn-filter-tag">
                Event: <strong>{labels[selectedKind] ?? selectedKind}</strong>
                <button
                  type="button"
                  className="tablecn-tag-remove"
                  onClick={() => setSelectedKind("all")}
                  title="Clear event filter"
                >
                  <XIcon width={11} height={11} />
                </button>
              </span>
            )}

            {search.trim() !== "" && (
              <span className="tablecn-filter-tag">
                Search: <strong>&ldquo;{search}&rdquo;</strong>
                <button
                  type="button"
                  className="tablecn-tag-remove"
                  onClick={() => setSearch("")}
                  title="Clear search"
                >
                  <XIcon width={11} height={11} />
                </button>
              </span>
            )}

            <button
              type="button"
              className="tablecn-filter-reset"
              onClick={resetAllFilters}
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* Privacy Notice Banner */}
      <div className="admin-privacy-banner">
        <ShieldIcon width={16} height={16} />
        <span>
          Your visits are never logged. Bots and visitors with Do Not Track are excluded.
          Zero cookies or IP addresses are stored; visitor hashes rotate daily.
        </span>
      </div>

      {/* Key Metric Stat Cards */}
      <section className="admin-grid">
        <div className="admin-stat-card">
          <div className="admin-card-head">
            <span className="admin-card-title">
              <BarChartIcon width={15} height={15} className="admin-card-icon" />
              Page Views
            </span>
            <span className="pill live">Last {days}d</span>
          </div>
          <div className="admin-card-body">
            <span className="n">{totals.views}</span>
            <span className="admin-card-action">Total page loads</span>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-card-head">
            <span className="admin-card-title">
              <UsersIcon width={15} height={15} className="admin-card-icon" />
              Daily Visitors
            </span>
            <span className="pill">Unique</span>
          </div>
          <div className="admin-card-body">
            <span className="n">{totals.visitors}</span>
            <span className="admin-card-action">Distinct daily hashes</span>
          </div>
        </div>

        {actions.map((r) => {
          const isSelected = selectedKind === r.kind;
          return (
            <div
              className="admin-stat-card"
              key={r.kind}
              style={{
                cursor: "pointer",
                borderColor: isSelected ? "var(--green)" : undefined,
                background: isSelected ? "var(--green-wash)" : undefined,
              }}
              onClick={() =>
                setSelectedKind(selectedKind === r.kind ? "all" : r.kind)
              }
              title={`Click to filter by ${labels[r.kind] ?? r.kind}`}
            >
              <div className="admin-card-head">
                <span className="admin-card-title">
                  <GlobeIcon width={15} height={15} className="admin-card-icon" />
                  {labels[r.kind] ?? r.kind}
                </span>
                <span className={`pill ${isSelected ? "live" : ""}`}>
                  {isSelected ? "Filtered" : "Event"}
                </span>
              </div>
              <div className="admin-card-body">
                <span className="n">{r.n}</span>
                <span className="admin-card-action">Tracked interactions</span>
              </div>
            </div>
          );
        })}
      </section>

      {/* Daily Views Trend Chart */}
      <section style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div className="admin-subheading">
          <h2>Views per day</h2>
          <span style={{ fontSize: 12, color: "var(--fg-3)", fontFamily: "var(--mono)" }}>
            Peak: {maxDaily} views/day
          </span>
        </div>

        {daily.length === 0 ? (
          <div className="admin-empty-state">
            <BarChartIcon
              width={28}
              height={28}
              style={{ color: "var(--fg-3)", marginBottom: 8 }}
            />
            <p className="muted" style={{ margin: 0 }}>
              No traffic recorded in this window.
            </p>
          </div>
        ) : (
          <div className="tablecn-card">
            <div className="analytics-chart-box">
              {daily.map((r) => {
                const count = Number(r.n);
                const pct = Math.max(4, Math.round((count / maxDaily) * 100));
                return (
                  <div className="analytics-bar-row" key={r.label}>
                    <span className="analytics-bar-label">{r.label}</span>
                    <div className="analytics-bar-track">
                      <div
                        className="analytics-bar-fill"
                        style={{ width: `${pct}%` }}
                        title={`${count} views`}
                      />
                    </div>
                    <span className="analytics-bar-val">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </section>

      {/* Top Pages & Outbound Clicks 2-Column Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))",
          gap: 24,
        }}
      >
        {/* Top Pages Table */}
        <section style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div className="admin-subheading">
            <h2>Top pages</h2>
            <span style={{ fontSize: 12, color: "var(--fg-3)", fontFamily: "var(--mono)" }}>
              {filteredPages.length} {filteredPages.length === 1 ? "route" : "routes"}
            </span>
          </div>

          <div className="tablecn-card">
            {filteredPages.length === 0 ? (
              <div className="admin-empty-state">
                <p className="muted" style={{ margin: 0 }}>
                  {search
                    ? `No routes matching "${search}".`
                    : "No views recorded yet."}
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
                    <th>Path</th>
                    <th style={{ width: 120 }}>Share</th>
                    <th style={{ width: 70, textAlign: "right" }}>Views</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPages.map((r, i) => {
                    const views = Number(r.n);
                    const pct = Math.round((views / totalViewsCount) * 100);
                    return (
                      <tr key={r.path}>
                        <td>
                          <span className={`rank-badge ${i === 0 ? "top-1" : ""}`}>
                            {i + 1}
                          </span>
                        </td>
                        <td>
                          <code style={{ fontSize: 12 }}>{r.path}</code>
                        </td>
                        <td>
                          <div className="tablecn-progress-cell">
                            <div className="tablecn-progress-bar">
                              <div
                                className="tablecn-progress-fill"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                            <span
                              style={{
                                fontSize: 11,
                                color: "var(--fg-3)",
                                fontFamily: "var(--mono)",
                                width: 28,
                                textAlign: "right",
                              }}
                            >
                              {pct}%
                            </span>
                          </div>
                        </td>
                        <td
                          style={{
                            textAlign: "right",
                            fontFamily: "var(--mono)",
                            fontWeight: 600,
                          }}
                        >
                          {views}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </section>

        {/* Who Got Clicked */}
        <section style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div className="admin-subheading">
            <h2>Who got clicked</h2>
            <span style={{ fontSize: 12, color: "var(--fg-3)", fontFamily: "var(--mono)" }}>
              {filteredTargets.length}{" "}
              {filteredTargets.length === 1 ? "target" : "targets"}
            </span>
          </div>

          <div className="tablecn-card">
            {filteredTargets.length === 0 ? (
              <div className="admin-empty-state">
                <p className="muted" style={{ margin: 0 }}>
                  {search || selectedKind !== "all"
                    ? "No events matching your active filters."
                    : "No interaction events recorded yet."}
                </p>
                {(search || selectedKind !== "all") && (
                  <button
                    type="button"
                    className="tablecn-filter-reset"
                    style={{ marginTop: 8 }}
                    onClick={() => {
                      setSearch("");
                      setSelectedKind("all");
                    }}
                  >
                    Clear event & search filters
                  </button>
                )}
              </div>
            ) : (
              <table className="tablecn-table">
                <thead>
                  <tr>
                    <th style={{ width: 120 }}>Action</th>
                    <th>Target</th>
                    <th style={{ width: 70, textAlign: "right" }}>Clicks</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTargets.map((r) => (
                    <tr key={r.kind + r.target}>
                      <td>
                        <span
                          className={`pill ${
                            selectedKind === r.kind ? "live" : ""
                          }`}
                          style={{ fontSize: 10, cursor: "pointer" }}
                          onClick={() =>
                            setSelectedKind(
                              selectedKind === r.kind ? "all" : r.kind
                            )
                          }
                          title="Click to filter by this event type"
                        >
                          {labels[r.kind] ?? r.kind}
                        </span>
                      </td>
                      <td>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                          }}
                        >
                          <code style={{ fontSize: 12 }}>{r.target}</code>
                          {r.target.startsWith("http") && (
                            <a
                              href={r.target}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                color: "var(--fg-3)",
                                display: "inline-grid",
                                placeItems: "center",
                              }}
                              title="Visit destination"
                            >
                              <ExternalLinkIcon width={12} height={12} />
                            </a>
                          )}
                        </div>
                      </td>
                      <td
                        style={{
                          textAlign: "right",
                          fontFamily: "var(--mono)",
                          fontWeight: 600,
                        }}
                      >
                        {r.n}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
