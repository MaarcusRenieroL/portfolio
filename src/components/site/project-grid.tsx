"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { CATEGORIES, PROJECTS } from "~/lib/content";
import { ProjectCard } from "./ui";

export function ProjectGrid() {
  const [f, setF] = useState("all");
  const shown = PROJECTS.filter((p) => f === "all" || p.cats.includes(f as never));

  return (
    <>
      <div className="wrap" style={{ position: "relative" }}>
        <div className="row" style={{ gap: 8, flexWrap: "wrap", paddingBottom: 32, borderBottom: "1px solid var(--line)" }} role="group" aria-label="Filter projects">
          {CATEGORIES.map(([id, label]) => (
            <button key={id} className={`chip${f === id ? " on" : ""}`} type="button" aria-pressed={f === id} onClick={() => setF(id)}>
              {label}
            </button>
          ))}
          <span className="label" style={{ marginLeft: "auto" }} aria-live="polite">
            {shown.length} of {PROJECTS.length}
          </span>
        </div>
      </div>
      <section className="section-sm" style={{ paddingTop: 48 }}>
        <motion.div layout className="wrap grid-auto" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(min(340px, 100%), 1fr))", gap: 28 }}>
          <AnimatePresence mode="popLayout" initial={false}>
            {shown.map((p, i) => (
              <motion.div
                key={p.slug}
                layout
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
                style={{ display: "flex" }}
              >
                <ProjectCard p={p} delay={f === "all" ? i * 60 : 0} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </section>
    </>
  );
}
