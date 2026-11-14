/** Newest first. Add an entry when something visitors can see changes. */
export type ChangelogEntry = { date: string; title: string; points: string[] };

export const CHANGELOG: ChangelogEntry[] = [
  {
    date: "2026-11-14",
    title: "German version",
    points: [
      "The whole site is available in German. Use the EN/DE toggle in the header; the page stays where it is and your choice is remembered.",
      "The German text is AI-translated so German readers can follow what I do. I am learning German at A2, not C1.",
    ],
  },
  {
    date: "2026-11-14",
    title: "Certifications, sharing and shortcuts",
    points: [
      "New certifications page with previews, search and issuer filters, plus verification links where the issuer allows them.",
      "Filters on projects, skills and certifications now live in the URL, so a filtered view can be shared.",
      "Every page has its own share image. Added a contact card download, a keyboard shortcuts list (press ?) and this changelog.",
      "The 404 page can search the site. The resume prints cleanly.",
    ],
  },
  {
    date: "2026-11-14",
    title: "Skills, command palette and intro",
    points: [
      "Skills are flat pills with search and a category filter. The Stack page was merged into it.",
      "Command palette on Ctrl/⌘ K. Resume moved into the nav.",
      "A three-sword intro plays once per tab and is off for reduced motion.",
      "Real company logos, photo placeholders and rate limiting on generated images.",
    ],
  },
  {
    date: "2026-11-14",
    title: "Light and dark theme, particles and redesign",
    points: ["Light and dark theme with a circular reveal when switching.", "Projects as cards, a particle background and social links in the footer.", "Case studies were removed while a new format is planned."],
  },
];
