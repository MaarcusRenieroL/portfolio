/** Newest first. Add an entry when something visitors can see changes. Titles must be unique (they are the list keys). */
export type ChangelogEntry = { date: string; title: string; points: string[] };

export const CHANGELOG: ChangelogEntry[] = [
  {
    date: "2026-11-19",
    title: "Skills, rebuilt around evidence",
    points: [
      "The skills page is now one row per category, and each skill is marked by where I used it: a filled dot for at work, a ring for my own projects, no mark for things I learned or practised.",
      "Skills I used at work read first. The marks come from my own job descriptions, so they match the experience page.",
      "Search and the All / At work / In my projects filter dim what doesn't match instead of reshuffling the page, and the filter is part of the link, so a filtered view can be shared.",
      "Buttons and links react when you point at them: buttons light up with a green ring and glow, links draw a green underline. All of it is off if your system asks for reduced motion.",
    ],
  },
  {
    date: "2026-11-17",
    title: "Faster, and served from my own domains",
    points: [
      "Pages load faster on phones: the search palette and the booking dialog now load only when you open them, and the page styles are a third smaller. Lighthouse on the live site: 94 on mobile and 100 on desktop for performance, 100 for accessibility, best practices and SEO.",
      "Images, certificates and the résumé PDF come from assets.maarcus.dev.",
      "The site moved to Vercel, after a short outage on the old server.",
    ],
  },
  {
    date: "2026-11-17",
    title: "Privacy and legal pages",
    points: [
      "A privacy page that lists exactly what is stored and for how long: anonymous visit counts for 13 months, contact messages for 12 months, and booked calls for 12 months after the call. Older data is deleted automatically every day.",
      "A legal page with how to report a copyright problem and get something taken down.",
      "Contact messages are now kept, so nothing is lost if an email doesn't arrive. The form says so.",
    ],
  },
  {
    date: "2026-11-17",
    title: "Fixes",
    points: [
      "\"Schedule a call\" no longer gets stuck on \"Loading open times\" the first time you open it.",
      "The green accent is darker in the light theme, so small green text is easier to read.",
      "Filter dropdowns no longer push their label off-centre, skill tags are one height on phones, and the email address on the contact page gets its own row on narrow screens.",
      "On the home page, two featured projects fill two columns instead of leaving an empty third.",
    ],
  },
  {
    date: "2026-11-14",
    title: "Booking a call and live status",
    points: [
      "\"Schedule a call\" opens a calendar with open times shown in your own time zone, and sends a calendar invite you can add to Google Calendar or download.",
      "The home page shows whether I am online on Discord and what I am listening to on Spotify.",
      "The GitHub activity graph and the project list use my real GitHub data.",
    ],
  },
  {
    date: "2026-11-14",
    title: "Writing and a private editor",
    points: [
      "Blog posts and short notes have a heading navigation on the side, and page titles scramble in when you arrive.",
      "I can edit everything on the site from a private admin, preview it live and publish when it is ready.",
      "Visit counts are anonymous and cookieless: no tracking cookies, no addresses stored, and Do Not Track is respected.",
    ],
  },
  {
    date: "2026-11-14",
    title: "German version",
    points: [
      "The whole site is available in German. Use the EN/DE toggle in the header; the page stays where it is and your choice is remembered.",
      "The German text is AI-translated so German readers can follow what I do. I am learning German myself (A1, working toward B1).",
    ],
  },
  {
    date: "2026-11-14",
    title: "Certifications, sharing and shortcuts",
    points: [
      "A certifications page with previews, search and issuer filters, plus verification links where the issuer allows them.",
      "Filters on projects, skills and certifications live in the link, so a filtered view can be shared.",
      "Every page has its own share image. Added a contact card download, a keyboard shortcuts list (press ?), an RSS feed and this changelog.",
      "The 404 page can search the site. The résumé prints cleanly.",
    ],
  },
  {
    date: "2026-11-14",
    title: "Skills, command palette and intro",
    points: [
      "Skills became searchable pills with a category filter, and the Stack page was merged into Skills.",
      "Command palette on Ctrl/⌘ K. Résumé moved into the main navigation.",
      "A three-sword intro plays once per tab and is off for reduced motion.",
      "Real company logos, photo placeholders and rate limiting on generated images.",
    ],
  },
  {
    date: "2026-11-14",
    title: "Light and dark theme",
    points: [
      "Light and dark theme, with a circular reveal when you switch.",
      "Projects as cards, a faint particle background and social links in the footer.",
      "The contact form checks for bots and limits how often it can be sent.",
      "Case studies were removed while a new format is planned.",
    ],
  },
  {
    date: "2026-11-04",
    title: "A new version of the site",
    points: [
      "Rebuilt from scratch on a quieter design: one column, small type, hairline dividers and a single green accent.",
      "Home, experience and about are rewritten around the role I am looking for.",
      "Projects have search, filters, icons and keyboard shortcuts (j and k to move, Enter to open, / to search).",
      "Writing has search, tags, related posts and a table of contents that follows you down the page.",
      "The résumé shows the PDF itself instead of a text copy, and scrolling is smooth throughout.",
    ],
  },
];
