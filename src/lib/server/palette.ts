import type { PaletteItem } from "~/components/site/command-palette";
import { SCHEDULE_EVENT } from "~/lib/booking-event";
import { NAV_LINKS, SITE } from "~/lib/content";
import { DICT } from "~/lib/dict";
import { localePath, type Lang } from "~/lib/i18n";
import { getPostList } from "~/lib/posts";
import type { Certificate, Project, Role } from "~/lib/schema";
import { getSiteContent, type SkillGroup } from "~/lib/site-content";
import { getSiteSettings } from "./settings";

/**
 * Everything the command palette can find. Served by /api/palette when the palette first opens,
 * instead of being embedded in every page's HTML.
 */
export async function getPaletteItems(lang: Lang): Promise<PaletteItem[]> {
  const { projects, roles, skills, certificates } = await getSiteContent(lang);
  const showWriting = (await getPostList("post", lang)).length > 0;
  const showNotes = (await getPostList("note", lang)).length > 0;
  const { now } = await getSiteSettings();
  const hasNow = Boolean(now.en.trim() || now.de.trim());
  return paletteItems(lang, showWriting, showNotes, projects, roles, skills, certificates, hasNow);
}

function paletteItems(
  lang: Lang,
  showWriting: boolean,
  showNotes: boolean,
  projects: Project[],
  roles: Role[],
  skills: SkillGroup[],
  certificates: Certificate[],
  hasNow = false
): PaletteItem[] {
  const d = DICT[lang];
  const navLabel = (href: string) => d.nav[(href === "/" ? "home" : href === "/blog" ? "writing" : href.slice(1)) as keyof typeof d.nav];

  // Deep Search: Technical Skills
  const skillItems: PaletteItem[] = skills.flatMap((g) =>
    g.items.map((skill): PaletteItem => ({
      id: `skill-${g.name}-${skill}`.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      group: "Skills",
      label: skill,
      hint: g.name,
      keywords: g.name,
      run: "href",
      value: localePath(lang, `/skills?q=${encodeURIComponent(skill)}`),
    }))
  );

  // Deep Search: Experience & Roles
  const roleItems: PaletteItem[] = roles.map((r): PaletteItem => {
    const slug = r.org.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    return {
      id: `role-${slug}`,
      group: "Experience",
      label: `${r.org} — ${r.title}`,
      hint: `${r.date}${r.place ? ` · ${r.place}` : ""}`,
      keywords: `${r.place ?? ""} ${r.tags?.join(" ") ?? ""}`,
      run: "href",
      value: localePath(lang, `/experience#${slug}`),
    };
  });

  // Deep Search: Certifications
  const certItems: PaletteItem[] = certificates.map((c): PaletteItem => ({
    id: `cert-${c.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
    group: "Certifications",
    label: c.title,
    hint: `${c.issuer} · ${c.date}`,
    keywords: c.issuer,
    run: "href",
    value: localePath(lang, `/certifications?q=${encodeURIComponent(c.title)}`),
  }));

  return [
    // Pages
    ...NAV_LINKS.filter((l) => (showWriting || l.href !== "/blog") && (showNotes || l.href !== "/notes")).map((l): PaletteItem => ({
      id: `page-${l.href}`,
      group: "Pages",
      label: navLabel(l.href),
      hint: localePath(lang, l.href),
      run: "href",
      value: localePath(lang, l.href)
    })),
    ...(hasNow ? [{ id: "page-now", group: "Pages" as const, label: d.now.title, hint: localePath(lang, "/now"), run: "href" as const, value: localePath(lang, "/now") }] : []),

    // Quick Actions
    { id: "resume-download", group: "Actions", label: d.palette.items.resume ?? "Download Resume (PDF)", hint: "PDF · 1 page", keywords: "cv resume lebenslauf download pdf document", run: "download", value: "/api/resume" },
    { id: "schedule", group: "Actions", label: d.palette.items.schedule, hint: "15 / 30 / 45 min", keywords: "meeting call schedule calendar appointment booking termin", run: "event", value: SCHEDULE_EVENT },
    { id: "theme", group: "Actions", label: d.palette.items.theme, keywords: "dark light mode hell dunkel toggle theme appearance", run: "theme" },
    { id: "sound", group: "Actions", label: d.palette.items.sound ?? "Toggle sound effects", keywords: "sound audio mechanical clicks mute volume audio-effects", run: "sound" },
    { id: "email", group: "Actions", label: d.palette.items.email, hint: SITE.email, keywords: "email mail contact copy address message", run: "copy", value: SITE.email },
    { id: "vcard", group: "Actions", label: d.palette.items.vcard, hint: ".vcf", keywords: "save contact vcard addressbook phone mobile", run: "download", value: "/api/vcard" },
    { id: "shortcuts", group: "Actions", label: d.palette.items.shortcuts, hint: "?", keywords: "keys help shortcuts keybindings hotkeys", run: "event", value: "shortcuts:open" },
    ...(SITE.call ? [{ id: "call", group: "Actions", label: d.palette.items.call, run: "external", value: SITE.call } as PaletteItem] : []),
    { id: "github", group: "Actions", label: d.palette.items.github, hint: "github.com/MaarcusRenieroL", keywords: "git source code repository profile oss", run: "external", value: SITE.github },
    { id: "linkedin", group: "Actions", label: d.palette.items.linkedin, hint: "linkedin.com/in/maarcusrenierol", keywords: "connect network linkedin social professional", run: "external", value: SITE.linkedin },

    // Projects
    ...projects
      .filter((p) => p.site ?? p.github)
      .map((p): PaletteItem => ({
        id: `project-${p.slug}`,
        group: "Projects",
        label: p.name,
        hint: p.kind,
        keywords: p.skills.join(" "),
        run: "external",
        value: p.site ?? p.github,
      })),

    // Deep Search Collections
    ...skillItems,
    ...roleItems,
    ...certItems,
  ];
}

