"use client";

import * as React from "react";
import { ArrowUpRight, ChevronDown, ChevronsUpDown, Sparkles, X } from "lucide-react";
import * as m from "motion/react-m";
import { useInView, useScroll, useSpring } from "motion/react";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { SkillCrosslink } from "~/components/skills/skill-crosslink-card";
import { logoUrl } from "~/lib/site";
import type { Role } from "~/lib/schema";
import type { Lang } from "~/lib/i18n";
import { DICT } from "~/lib/dict";
import { cn } from "~/lib/utils";
import { Pic } from "~/components/site/media";
import { isSkillMatch } from "~/lib/skill-match";

const initials = (name: string) =>
  name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

interface ExperienceTimelineProps {
  roles: Role[];
  lang: Lang;
}

interface MilestoneItemProps {
  role: Role;
  idx: number;
  dict: (typeof DICT)[Lang]["experience"];
  openItems: string[];
  toggleItem: (id: string) => void;
  activeSkill: string | null;
  handleSkillSelect: (skill: string) => void;
}

function MilestoneItem({
  role: r,
  idx,
  dict,
  openItems,
  toggleItem,
  activeSkill,
  handleSkillSelect,
}: MilestoneItemProps) {
  const itemRef = React.useRef<HTMLDivElement>(null);
  const isInView = useInView(itemRef, {
    margin: "-20% 0px -35% 0px",
  });

  const itemId = `exp-${idx}`;
  const isNow = Boolean(r.now);
  const topPath = r.path?.[0];
  const displayDate = topPath ? `${topPath.date} — ${dict.now}` : r.date;

  const isCardOpen = openItems.includes(itemId);
  const matchesActiveSkill = activeSkill ? Boolean(r.tags?.some((t) => isSkillMatch(activeSkill, t))) : false;

  // The button/node point glows when current, scrolled into view, or matching skill
  const isGlowing = isNow || isInView || matchesActiveSkill;

  const logoSrc = r.logo ? logoUrl(r.logo) : "";

  // Separate award/recognition from work points if present
  const awardPoint = r.points?.find((p) =>
    /award|shining star|recognition/i.test(p)
  );
  // Points starting with "[" are private notes in the content file, never shown.
  const workPoints = r.points?.filter((p) => p !== awardPoint && !p.startsWith("[")) ?? [];

  return (
    <div
      ref={itemRef}
      id={r.org.toLowerCase().replace(/[^a-z0-9]+/g, "-")}
      className={cn(
        "timeline-item group relative grid grid-cols-[2rem_minmax(0,1fr)] md:grid-cols-[10rem_4rem_minmax(0,1fr)] items-start transition-opacity duration-200 scroll-mt-24 gap-3 md:gap-0",
        activeSkill && !matchesActiveSkill && "opacity-40"
      )}
    >
      {/* Column 1 (Desktop): Date & Location (Fully Left-Aligned) */}
      <div className="timeline-date hidden md:flex flex-col items-start text-left pt-4 select-none pr-2">
        <span
          className={cn(
            "font-mono text-xs tracking-tight transition-colors tabular-nums font-medium",
            isGlowing
              ? "text-[var(--green)] font-semibold"
              : "text-[var(--fg-3)] group-hover:text-[var(--fg-2)]"
          )}
        >
          {displayDate}
        </span>
        {isNow && (
          <Badge
            variant="default"
            className="text-[10px] uppercase font-mono tracking-wider py-0 px-1.5 h-4 bg-[var(--green)]/15 text-[var(--green)] border-[var(--green)]/30 mt-1"
          >
            {dict.now}
          </Badge>
        )}
        {r.place && (
          <span className="font-mono text-[11px] text-[var(--fg-3)] mt-1">
            {r.place}
          </span>
        )}
      </div>

      {/* Column 2 (or Col 1 on Mobile): Timeline Rail Node + Horizontal Connector Line to Header */}
      <div
        className="timeline-rail relative flex self-stretch items-start justify-center md:justify-start pt-[34px] md:pt-[26px]"
        aria-hidden="true"
      >
        {/* Timeline Node Point (Glows when scrolled into view or active) */}
        <div
          className={cn(
            "md:absolute md:left-[1.25rem] -translate-y-1/2 z-20 rounded-full transition-all duration-300 shrink-0",
            isGlowing
              ? "w-3.5 h-3.5 bg-[var(--green)] ring-4 ring-[var(--green)]/25 shadow-[0_0_14px_rgba(74,222,128,0.65)] scale-110"
              : "w-2.5 h-2.5 bg-[var(--bg)] border-2 border-[var(--fg-3)] group-hover:border-[var(--green)] group-hover:scale-125"
          )}
        />

        {/* Horizontal Connector Line: Bridges from the point directly to the card header */}
        <div
          className={cn(
            "absolute left-[50%] md:left-[1.25rem] right-0 top-[34px] md:top-[26px] h-px transition-colors duration-300 pointer-events-none",
            isGlowing
              ? "bg-[var(--green)] shadow-[0_0_8px_rgba(74,222,128,0.4)]"
              : "bg-[var(--line-2)] group-hover:bg-[var(--green)]/60"
          )}
        />
      </div>

      {/* Column 3 (or Col 2 on Mobile): Experience Card */}
      <div className="timeline-card-col min-w-0">
        {/* Mobile Date Row above the card */}
        <div className="md:hidden flex flex-wrap items-center justify-between gap-x-2 gap-y-1 mb-2 font-mono text-xs text-[var(--fg-3)]">
          <div className="flex items-center gap-1.5">
            <span>{displayDate}</span>
            {isNow && (
              <Badge
                variant="default"
                className="text-[9px] uppercase font-mono py-0 px-1 h-3.5 bg-[var(--green)]/15 text-[var(--green)] border-[var(--green)]/30"
              >
                {dict.now}
              </Badge>
            )}
          </div>
          {r.place && <span>{r.place}</span>}
        </div>

        <div
          className={cn(
            "rounded-xl overflow-hidden bg-[var(--bg)] border border-[var(--line)] shadow-sm hover:border-[var(--line-2)] transition-all duration-300",
            !isCardOpen && "cursor-pointer",
            isCardOpen && "border-[var(--green)]/30",
            isGlowing && "border-[var(--green)]/40 shadow-[0_4px_24px_-8px_rgba(74,222,128,0.12)]",
            matchesActiveSkill && "border-[var(--green)] ring-1 ring-[var(--green)] bg-[var(--green)]/[0.02]"
          )}
        >
          {/* Card Header (Clickable to toggle) */}
          {/* Mouse users can click anywhere on the header; keyboard and screen-reader users get the chevron button. */}
          <div
            onClick={() => toggleItem(itemId)}
            className={cn(
              "w-full px-5 py-4 cursor-pointer text-left transition-colors hover:bg-[var(--hover)]/30 flex items-start justify-between gap-3 select-none",
              isCardOpen && "border-b border-[var(--line)]"
            )}
          >
            <div className="flex items-start gap-4 flex-1 min-w-0 pr-2">
              {/* Organization Logo with clean high-contrast white tile */}
              <div className="shrink-0 flex items-center justify-center">
                <Pic
                  src={logoSrc}
                  alt=""
                  // .logo / .logo-dark: light artwork (logoOn: "dark") sits on a dark tile
                  className={`${r.logoOn === "dark" ? "logo logo-dark" : "logo"} !w-11 !h-11 !p-1.5`}
                  fallback={<span className="font-mono text-xs font-semibold text-neutral-900">{initials(r.org)}</span>}
                />
              </div>

              {/* Role & Org Details */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="tl-org font-semibold text-sm sm:text-base text-[var(--fg)] tracking-tight hover:text-[var(--green)] transition-colors">
                    {r.url ? (
                      <a
                        href={r.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="orglink inline-flex items-center gap-1.5 hover:underline group/org"
                      >
                        <span>{r.org}</span>
                        <ArrowUpRight className="w-3.5 h-3.5 opacity-65 group-hover/org:opacity-100 group-hover/org:translate-x-0.5 group-hover/org:-translate-y-0.5 transition-all inline shrink-0 align-middle" />
                      </a>
                    ) : (
                      r.org
                    )}
                  </h2>
                </div>

                <p className="text-xs sm:text-[13px] text-[var(--fg-2)] mt-0.5 line-clamp-2 sm:line-clamp-1">
                  {r.title}
                </p>

                {/* Tags Preview when closed */}
                {!isCardOpen && r.tags && r.tags.length > 0 && (
                  <div
                    className="flex flex-wrap items-center gap-1.5 mt-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {r.tags.slice(0, 3).map((tag) => (
                      <SkillCrosslink
                        key={tag}
                        skill={tag}
                        onSkillSelect={handleSkillSelect}
                      >
                        <span
                          className={cn(
                            "inline-block px-1.5 py-0.5 rounded text-[10px] font-mono border transition-colors",
                            activeSkill?.toLowerCase() === tag.toLowerCase()
                              ? "bg-[var(--green)] text-[var(--green-ink)] border-[var(--green)]"
                              : "bg-[var(--hover)] text-[var(--fg-3)] border-[var(--line)] hover:border-[var(--green)] hover:text-[var(--fg)]"
                          )}
                        >
                          {tag}
                        </span>
                      </SkillCrosslink>
                    ))}
                    {r.tags.length > 3 && (
                      <span className="text-[10px] font-mono text-[var(--fg-3)]">
                        {dict.more(r.tags.length - 3)}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>

            <button
              type="button"
              aria-expanded={isCardOpen}
              aria-controls={`${itemId}-body`}
              aria-label={dict.toggle(r.org)}
              onClick={(e) => {
                e.stopPropagation();
                toggleItem(itemId);
              }}
              className="shrink-0 -m-1.5 mt-[-2px] rounded p-2 text-[var(--fg-3)] hover:text-[var(--fg)] focus-visible:outline focus-visible:outline-1 focus-visible:outline-[var(--green)]"
            >
              <ChevronDown className={cn("h-4 w-4 transition-transform duration-200", isCardOpen && "rotate-180")} aria-hidden="true" />
            </button>
          </div>

          {/* Card Content (Body) */}
          {isCardOpen && (
            <div id={`${itemId}-body`} className="p-5 sm:p-6 space-y-4 text-xs sm:text-[13.5px] leading-relaxed text-[var(--fg-2)]">
              {/* Executive Lead Summary */}
              {r.summary && (
                <div className="text-[13.5px] sm:text-sm leading-relaxed text-[var(--fg)] font-normal pb-1 border-b border-[var(--line)]/60">
                  {r.summary}
                </div>
              )}

              {/* Award / Accolade Highlight Banner */}
              {awardPoint && (
                <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-lg border border-[var(--green)]/30 bg-[var(--green)]/[0.06] text-[12px] sm:text-[12.5px] text-[var(--green)]">
                  <Sparkles className="w-3.5 h-3.5 text-[var(--green)] shrink-0" />
                  <span className="font-medium tracking-tight">
                    {awardPoint}
                  </span>
                </div>
              )}

              {/* Refactored Technical Contributions with > markers */}
              {workPoints.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  <span className="font-mono text-[10.5px] uppercase tracking-wider text-[var(--fg-3)]">
                    {dict.work}
                  </span>
                  <ul className="space-y-2 text-[12.5px] sm:text-[13px] text-[var(--fg-2)] leading-relaxed">
                    {workPoints.map((point) => (
                      <li
                        key={point}
                        className="flex items-start gap-2"
                      >
                        <span className="text-[var(--green)] font-mono font-bold text-sm select-none leading-none mt-0.5 shrink-0">
                          ›
                        </span>
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Tech Stack Tags */}
              {r.tags && r.tags.length > 0 && (
                <div className="pt-3 border-t border-[var(--line)] flex flex-wrap items-center gap-1.5">
                  <span className="font-mono text-[10.5px] uppercase tracking-wider text-[var(--fg-3)] mr-1">
                    {dict.stack}
                  </span>
                  {r.tags.map((tag) => (
                    <SkillCrosslink
                      key={tag}
                      skill={tag}
                      onSkillSelect={handleSkillSelect}
                    >
                      <Badge
                        variant="secondary"
                        className={cn(
                          "font-mono text-[11px] py-0.5 px-2 transition-all cursor-pointer",
                          activeSkill?.toLowerCase() === tag.toLowerCase()
                            ? "bg-[var(--green)] text-[var(--green-ink)] border-[var(--green)]"
                            : "bg-[var(--hover)] text-[var(--fg-2)] border border-[var(--line)] hover:border-[var(--green)]"
                        )}
                      >
                        {tag}
                      </Badge>
                    </SkillCrosslink>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface SubstepItemProps {
  step: {
    org: string;
    date: string;
    note: string;
  };
  parentOrg: string;
  activeSkill: string | null;
}

function SubstepItem({ step, parentOrg, activeSkill, label }: SubstepItemProps & { label: string }) {
  const itemRef = React.useRef<HTMLDivElement>(null);
  const isInView = useInView(itemRef, {
    margin: "-20% 0px -35% 0px",
  });

  return (
    <div
      ref={itemRef}
      className={cn(
        "timeline-item group relative grid grid-cols-[2rem_minmax(0,1fr)] md:grid-cols-[10rem_4rem_minmax(0,1fr)] items-start transition-opacity duration-200 gap-3 md:gap-0",
        activeSkill && "opacity-40"
      )}
    >
      {/* Column 1 (Desktop Date) */}
      <div className="timeline-date hidden md:flex flex-col items-start text-left pt-2.5 select-none pr-2">
        <span
          className={cn(
            "font-mono text-xs tracking-tight transition-colors tabular-nums",
            isInView ? "text-[var(--green)] font-medium" : "text-[var(--fg-3)]"
          )}
        >
          {step.date}
        </span>
        <span className="text-[10px] font-mono text-[var(--fg-3)] opacity-60">
          {label}
        </span>
      </div>

      {/* Column 2 (or Col 1 on Mobile): Timeline Rail Node + Connector Line */}
      <div
        className="timeline-rail relative flex self-stretch items-start justify-center md:justify-start pt-[26px] md:pt-[18px]"
        aria-hidden="true"
      >
        <div
          className={cn(
            "md:absolute md:left-[1.25rem] -translate-y-1/2 z-20 rounded-full transition-all duration-300 shrink-0",
            isInView
              ? "w-2.5 h-2.5 bg-[var(--green)] ring-4 ring-[var(--green)]/20 shadow-[0_0_8px_rgba(74,222,128,0.5)]"
              : "w-2 h-2 bg-[var(--bg)] border border-[var(--fg-3)] group-hover:border-[var(--green)]"
          )}
        />
        <div
          className={cn(
            "absolute left-[50%] md:left-[1.25rem] right-0 top-[26px] md:top-[18px] h-px transition-colors duration-300 pointer-events-none",
            isInView ? "bg-[var(--green)]/60" : "bg-[var(--line-2)]"
          )}
        />
      </div>

      {/* Column 3 (or Col 2 on Mobile): Compact Milestone Tile */}
      <div className="timeline-card-col min-w-0">
        {/* Mobile Date Header */}
        <div className="md:hidden flex items-center justify-between text-xs font-mono text-[var(--fg-3)] mb-1">
          <span>{step.date}</span>
          <span className="text-[11px]">{label}</span>
        </div>

        <div className="px-4 py-3 rounded-lg border border-[var(--line)] bg-[var(--hover)]/25 hover:bg-[var(--hover)]/45 hover:border-[var(--line-2)] transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-4">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--green)] shrink-0" />
            <h3 className="tl-org font-semibold text-xs sm:text-[13px] text-[var(--fg)]">
              {step.org}
            </h3>
            <span className="text-[10px] font-mono text-[var(--fg-3)] hidden sm:inline opacity-75">
              · {parentOrg}
            </span>
          </div>
          <p className="text-xs text-[var(--fg-2)] sm:text-right font-sans">
            {step.note}
          </p>
        </div>
      </div>
    </div>
  );
}

export function ExperienceTimeline({ roles, lang }: ExperienceTimelineProps) {
  const dict = DICT[lang].experience;
  const containerRef = React.useRef<HTMLDivElement>(null);
  const allIds = React.useMemo(() => roles.map((_, i) => `exp-${i}`), [roles]);
  const [openItems, setOpenItems] = React.useState<string[]>(
    roles.length > 0 ? ["exp-0"] : []
  );
  const [activeSkill, setActiveSkill] = React.useState<string | null>(null);

  // Scroll-driven timeline progress line
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 65%", "end 75%"],
  });

  const scaleY = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 24,
    restDelta: 0.001,
  });

  const toggleAll = () => {
    if (openItems.length === roles.length) {
      setOpenItems([]);
    } else {
      setOpenItems(allIds);
    }
  };

  const toggleItem = (id: string) => {
    setOpenItems((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const isAllOpen = openItems.length === roles.length;

  const handleSkillSelect = (skill: string) => {
    if (activeSkill?.toLowerCase() === skill.toLowerCase()) {
      setActiveSkill(null);
    } else {
      setActiveSkill(skill);
      // Auto-open roles that match this skill
      const matchingIds = roles
        .map((r, i) => (r.tags?.some((t) => isSkillMatch(skill, t)) ? `exp-${i}` : null))
        .filter(Boolean) as string[];
      if (matchingIds.length > 0) {
        setOpenItems((prev) => Array.from(new Set([...prev, ...matchingIds])));
      }
    }
  };

  return (
    <div className="experience-timeline relative" ref={containerRef}>
      {/* Top action toolbar: Career milestones + Active skill filter + Expand/Collapse All */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-8 pb-3 border-b border-[var(--line)]">
        <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-[var(--fg-3)]">
          <span className="inline-block w-2 h-2 rounded-full bg-[var(--green)] animate-pulse" />
          <span>{dict.milestones(roles.length)}</span>
          {activeSkill && (
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border border-[var(--green)] bg-[var(--green)]/10 text-[var(--green)] text-[11px] font-sans">
              <span>{dict.skillFilter(activeSkill)}</span>
              <button
                type="button"
                onClick={() => setActiveSkill(null)}
                className="hover:opacity-75"
                aria-label={dict.clearSkill}
                title={dict.clearSkill}
              >
                <X className="w-3 h-3" aria-hidden="true" />
              </button>
            </span>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleAll}
          className="h-7 pointer-coarse:h-9 text-xs font-mono text-[var(--fg-3)] hover:text-[var(--fg)] hover:bg-[var(--hover)] gap-1.5 px-2.5"
        >
          <ChevronsUpDown className="h-3.5 w-3.5 text-[var(--green)]" />
          <span>{isAllOpen ? dict.collapseAll : dict.expandAll}</span>
        </Button>
      </div>

      {/* Main Timeline Spine & Cards */}
      <div className="relative space-y-6 sm:space-y-8">
        {/* Continuous Background Spine on Desktop (Starts at first node and runs through last) */}
        <div
          className="hidden md:block absolute left-[11.25rem] top-7 bottom-7 w-px bg-[var(--line-2)] pointer-events-none"
          aria-hidden="true"
        />

        {/* Scroll-Driven Dynamic Fill Spine on Desktop */}
        <m.div
          style={{ scaleY }}
          className="hidden md:block origin-top absolute left-[11.25rem] top-7 bottom-7 w-px bg-[var(--green)] shadow-[0_0_8px_rgba(74,222,128,0.6)] pointer-events-none z-10"
          aria-hidden="true"
        />

        {/* Continuous Background Spine on Mobile: centered exactly on the 2rem rail */}
        <div
          className="md:hidden absolute left-[1rem] -translate-x-1/2 top-7 bottom-7 w-px bg-[var(--line-2)] pointer-events-none"
          aria-hidden="true"
        />

        {/* Scroll-Driven Dynamic Fill Spine on Mobile */}
        <m.div
          style={{ scaleY }}
          className="md:hidden origin-top absolute left-[1rem] -translate-x-1/2 top-7 bottom-7 w-px bg-[var(--green)] shadow-[0_0_6px_rgba(74,222,128,0.6)] pointer-events-none z-10"
          aria-hidden="true"
        />

        {roles.map((r, idx) => (
          <React.Fragment key={r.org}>
            <MilestoneItem
              role={r}
              idx={idx}
              dict={dict}
              openItems={openItems}
              toggleItem={toggleItem}
              activeSkill={activeSkill}
              handleSkillSelect={handleSkillSelect}
            />

            {r.path?.slice(1).map((step) => (
              <SubstepItem key={step.org} step={step} parentOrg={r.org} activeSkill={activeSkill} label={dict.step} />
            ))}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
