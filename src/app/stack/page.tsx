import type { Metadata } from "next";
import { PageHeader } from "~/components/site/ui";
import { STACK_GROUPS } from "~/lib/content";

export const metadata: Metadata = { title: "Stack", description: "What I reach for, grouped by job." };

export default function StackPage() {
  return (
    <>
      <PageHeader
        kanji="具"
        eyebrow={`Stack · ${STACK_GROUPS.length} groups`}
        title="Tools of the trade"
        lead={<>What I reach for, grouped by job. <span className="tag tag-blade" style={{ verticalAlign: "middle" }}>Core</span> marks what I use in production or daily.</>}
      />
      <section style={{ paddingBottom: 96 }}>
        <div className="wrap">
          {STACK_GROUPS.map((g, i) => (
            <div className="grp" key={g.name} data-reveal>
              <span className="gnum mono h3 fg3">{String(i + 1).padStart(2, "0")}</span>
              <div className="stack" style={{ gap: 8 }}>
                <h2 className="h3">{g.name}</h2>
                <p className="small">{g.why}</p>
              </div>
              <div className="tags" style={{ gap: 10 }}>
                {g.items.map((t) => {
                  const core = t.startsWith("*");
                  return (
                    <span key={t} className={`tag${core ? " tag-blade" : ""}`} style={{ height: 34, padding: "0 14px", fontSize: 13 }}>
                      {core ? t.slice(1) : t}
                    </span>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
