"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useDict, useLang } from "~/components/site/locale";
import { SITE } from "~/lib/site";
import type { Contributions } from "~/lib/server/github";

/**
 * GitHub contribution calendar. Data is fetched on the server (real or nothing);
 * this only renders it. One shared tooltip follows the hovered day instead of a
 * tooltip per cell, and the grid is a single image to assistive tech, not 371 stops.
 */
export function ContributionHeatmap({ data }: { data: Contributions }) {
  const t = useDict().home;
  const lang = useLang();
  const locale = lang === "de" ? "de-DE" : "en-US";
  const boxRef = useRef<HTMLDivElement>(null);
  const [tip, setTip] = useState<{ text: string; x: number; y: number } | null>(null);

  const fmtDay = useMemo(() => new Intl.DateTimeFormat(locale, { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" }), [locale]);
  const fmtMonth = useMemo(() => new Intl.DateTimeFormat(locale, { month: "short", timeZone: "UTC" }), [locale]);

  const months = useMemo(() => {
    const out: { label: string; col: number }[] = [];
    let last = -1;
    data.weeks.forEach((week, col) => {
      const first = week[0];
      if (!first) return;
      const d = new Date(`${first.date}T00:00:00Z`);
      const m = d.getUTCMonth();
      if (m === last) return;
      last = m;
      // Skip a label that would collide with the next one (a partial first month).
      if (out.length && col - out[out.length - 1].col < 3) out.pop();
      out.push({ label: fmtMonth.format(d), col });
    });
    return out;
  }, [data.weeks, fmtMonth]);

  // On narrow screens the grid scrolls sideways: start at the newest weeks, not the oldest.
  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollLeft = el.scrollWidth;
  }, []);

  const total = data.total.toLocaleString(locale);
  const cols = { gridTemplateColumns: `repeat(${data.weeks.length}, minmax(0, 1fr))` };

  const show = (e: React.PointerEvent<HTMLDivElement>) => {
    const cell = (e.target as HTMLElement).closest<HTMLElement>("[data-n]");
    const box = boxRef.current;
    if (!cell || !box) return setTip(null);
    const c = cell.getBoundingClientRect();
    const b = box.getBoundingClientRect();
    const text = t.activityDay(Number(cell.dataset.n), fmtDay.format(new Date(`${cell.dataset.date}T00:00:00Z`)));
    setTip({ text, x: c.left - b.left + c.width / 2, y: c.top - b.top });
  };

  return (
    <div className="contrib-box" ref={boxRef}>
      <div className="contrib-scroll" ref={scrollRef}>
        <div className="contrib-grid-wrap">
          <div className="contrib-months" style={cols} aria-hidden="true">
            {months.map(({ label, col }) => (
              <span key={col} style={{ gridColumnStart: col + 1 }}>
                {label}
              </span>
            ))}
          </div>
          <div
            className="contrib-weeks"
            style={cols}
            role="img"
            aria-label={`${t.activityTotal(total)} GitHub`}
            onPointerOver={show}
            onPointerLeave={() => setTip(null)}
          >
            {data.weeks.map((week, w) => (
              <div key={w} className="contrib-week">
                {week.map((day, i) => (
                  <span
                    key={day.date}
                    className="contrib-cell"
                    data-level={day.level}
                    data-n={day.count}
                    data-date={day.date}
                    // The first week can start mid-week: push its first day down so weekdays line up.
                    style={w === 0 && i === 0 ? { gridRowStart: new Date(`${day.date}T00:00:00Z`).getUTCDay() + 1 } : undefined}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {tip && (
        <div className="contrib-tip" role="presentation" style={{ left: tip.x, top: tip.y }}>
          {tip.text}
        </div>
      )}

      <div className="contrib-foot">
        <span className="contrib-meta">
          {t.activityTotal(total)}{" "}
          <a className="gh-link" href={SITE.github} target="_blank" rel="noopener noreferrer" data-track="social-click" data-track-label="github-graph">
            GitHub
          </a>
        </span>
        <span className="contrib-legend" aria-hidden="true">
          {t.activityLess}
          <span className="contrib-legend-scale">
            {[0, 1, 2, 3, 4].map((l) => (
              <span key={l} className="contrib-legend-cell" data-level={l} />
            ))}
          </span>
          {t.activityMore}
        </span>
      </div>
    </div>
  );
}
