"use client";

import { Check, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { SiteSettings } from "~/lib/settings";
import { saveSettings } from "../settings-actions";
import { MarkdownEditor } from "./markdown-editor";
import { MediaField } from "./media-field";

type Both = { en: string; de: string };

function Section({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <section className="grid gap-4 border-t border-[var(--line)] py-8 first:border-t-0 first:pt-0 md:grid-cols-[14rem_minmax(0,1fr)] md:gap-10">
      <div>
        <h2 className="text-[14px] font-medium text-[var(--fg)]">{title}</h2>
        <p className="mt-1 text-[12px] leading-relaxed text-[var(--fg-3)]">{description}</p>
      </div>
      <div className="min-w-0 space-y-5">{children}</div>
    </section>
  );
}

function Label({ htmlFor, children }: { htmlFor: string; children: React.ReactNode }) {
  return (
    <label htmlFor={htmlFor} className="mb-1.5 block text-[12px] font-medium text-[var(--fg-2)]" style={{ display: "block" }}>
      {children}
    </label>
  );
}

/** One text setting in English and German side by side; the default shows as the placeholder. */
function Bilingual({ id, label, value, fallback, onChange, multiline }: { id: string; label: string; value: Both; fallback: Both; onChange: (v: Both) => void; multiline?: boolean }) {
  const Field = multiline ? "textarea" : "input";
  return (
    <div>
      <p className="mb-1.5 text-[12px] font-medium text-[var(--fg-2)]">{label}</p>
      <div className="grid gap-2 sm:grid-cols-2">
        {(["en", "de"] as const).map((l) => (
          <div key={l} className="relative">
            <span className="pointer-events-none absolute right-2 top-2 font-mono text-[10px] uppercase text-[var(--fg-3)]">{l}</span>
            <Field
              id={`${id}-${l}`}
              aria-label={`${label} (${l === "en" ? "English" : "German"})`}
              value={value[l]}
              placeholder={fallback[l]}
              rows={multiline ? 5 : undefined}
              onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => onChange({ ...value, [l]: e.target.value })}
              className="!pr-8"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

/** English and German /now text, one language at a time. */
function NowEditor({ value, updated, onChange }: { value: Both; updated: string; onChange: (v: Both) => void }) {
  const [lang, setLang] = useState<"en" | "de">("en");
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <div className="inline-flex rounded-md border border-[var(--line)] p-0.5" role="tablist" aria-label="Language">
          {(["en", "de"] as const).map((l) => (
            <button
              key={l}
              type="button"
              role="tab"
              aria-selected={lang === l}
              onClick={() => setLang(l)}
              className={`inline-flex h-7 items-center rounded px-2.5 text-[12px] transition-colors pointer-coarse:h-9 ${lang === l ? "bg-[var(--hover)] text-[var(--fg)]" : "text-[var(--fg-3)] hover:text-[var(--fg)]"}`}
            >
              {l.toUpperCase()}
            </button>
          ))}
        </div>
        <span className="text-[11px] text-[var(--fg-3)]">{updated ? `Last updated ${updated}` : "Not published yet"}</span>
      </div>
      <MarkdownEditor key={lang} id={`s-now-${lang}`} value={value[lang]} onChange={(v) => onChange({ ...value, [lang]: v })} placeholder={lang === "en" ? "What are you building, learning and looking for right now? Type / for blocks." : "Die deutsche Fassung. Leer lassen, um Englisch zu zeigen."} />
    </div>
  );
}

/**
 * Site settings: photo, availability, the home page's headline and intro, location and résumé.
 * Text left empty falls back to the default copy (shown as the placeholder). Saving publishes.
 */
export function SettingsForm({ saved, defaults }: { saved: SiteSettings; defaults: SiteSettings }) {
  const router = useRouter();
  const [s, setS] = useState<SiteSettings>(saved);
  const [state, setState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [errors, setErrors] = useState<string[]>([]);
  const dirty = JSON.stringify(s) !== JSON.stringify(saved);
  const set = <K extends keyof SiteSettings>(k: K, v: SiteSettings[K]) => {
    setS((x) => ({ ...x, [k]: v }));
    setState("idle");
  };

  const save = async () => {
    setState("saving");
    const r = await saveSettings(s);
    if (r.ok) {
      setState("saved");
      setErrors([]);
      router.refresh();
    } else {
      setState("error");
      setErrors(r.errors);
    }
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        if (dirty) void save();
      }
    };
    const onLeave = (e: BeforeUnloadEvent) => {
      if (dirty) e.preventDefault();
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("beforeunload", onLeave);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("beforeunload", onLeave);
    };
  });

  return (
    <div>
      <Section title="Photo" description="Shown on the home and about pages. A 4:5 portrait works best.">
        <MediaField id="s-photo" value={s.photo} onChange={(v) => set("photo", v)} accept="image" />
      </Section>

      <Section title="Availability" description="The status badge next to your photo. Turn it off when you're not looking.">
        <label className="flex cursor-pointer items-center gap-3" style={{ display: "flex" }}>
          <input type="checkbox" checked={s.available} onChange={(e) => set("available", e.target.checked)} className="h-4 w-4 accent-[var(--green)]" style={{ width: 16, padding: 0 }} />
          <span className="text-[13px] text-[var(--fg)]">Show the badge</span>
        </label>
        <Bilingual id="s-label" label="Badge text" value={s.availableLabel} fallback={defaults.availableLabel} onChange={(v) => set("availableLabel", v)} />
      </Section>

      <Section title="Home page" description="The first thing anyone reads. The highlight is the green part after the headline.">
        <Bilingual id="s-title" label="Headline" value={s.heroTitle} fallback={defaults.heroTitle} onChange={(v) => set("heroTitle", v)} />
        <Bilingual id="s-hl" label="Highlight" value={s.heroHighlight} fallback={defaults.heroHighlight} onChange={(v) => set("heroHighlight", v)} />
        <Bilingual id="s-lead" label="Intro line" value={s.heroLead} fallback={defaults.heroLead} onChange={(v) => set("heroLead", v)} multiline />
        <Bilingual id="s-about" label="About paragraph" value={s.homeAbout} fallback={defaults.homeAbout} onChange={(v) => set("homeAbout", v)} multiline />
      </Section>

      <Section title="Location" description="Used in the intro line's default text and your contact details.">
        <div className="max-w-xs">
          <Label htmlFor="s-location">City, country</Label>
          <input id="s-location" value={s.location} placeholder={defaults.location} onChange={(e) => set("location", e.target.value)} />
        </div>
      </Section>

      <Section
        title="Now page"
        description="What you're focused on at the moment, at /now. Leave both empty and the page stays hidden. German falls back to English."
      >
        <NowEditor value={s.now} updated={saved.nowUpdated} onChange={(v) => set("now", v)} />
      </Section>

      <Section title="Résumé" description="The PDF behind /resume and every download link. Without one, the file in /public is used.">
        <MediaField id="s-resume" value={s.resume} onChange={(v) => set("resume", v)} accept="file" />
      </Section>

      <div className="sticky bottom-0 -mx-4 flex items-center gap-3 border-t border-[var(--line)] bg-[var(--bg)]/90 px-4 py-3 backdrop-blur-md sm:-mx-6 sm:px-6 lg:-mx-10 lg:px-10">
        <p className="flex-1 text-[12px] text-[var(--fg-3)]" aria-live="polite">
          {state === "saved" ? (
            <span className="inline-flex items-center gap-1.5 text-[var(--green)]">
              <Check className="h-3.5 w-3.5" /> Saved. It&apos;s live.
            </span>
          ) : state === "error" ? (
            <span className="text-[var(--danger)]">{errors.join(" ") || "Couldn't save."}</span>
          ) : dirty ? (
            "Unsaved changes"
          ) : (
            "Saving publishes straight away."
          )}
        </p>
        <button
          type="button"
          onClick={() => setS(saved)}
          disabled={!dirty || state === "saving"}
          className="inline-flex h-8 items-center rounded-md px-3 text-[13px] text-[var(--fg-3)] transition-colors hover:text-[var(--fg)] disabled:opacity-40 pointer-coarse:h-10"
        >
          Discard
        </button>
        <button
          type="button"
          onClick={() => void save()}
          disabled={!dirty || state === "saving"}
          className="inline-flex h-8 items-center gap-1.5 rounded-md bg-[var(--green)] px-3.5 text-[13px] font-medium text-[var(--green-ink)] transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40 pointer-coarse:h-10"
        >
          {state === "saving" && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
          Save and publish
        </button>
      </div>
    </div>
  );
}
