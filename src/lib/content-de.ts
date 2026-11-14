/** German text for content that lives in content.ts, keyed by the same slug or name. Anything missing falls back to English. */

export const PROJECTS_DE: Record<string, { kind?: string; status?: string; desc: string }> = {
  nyx: {
    kind: "macOS-App",
    status: "v1.0 · Open Source",
    desc: "Ein Offline-first-Launcher als Ersatz für Spotlight, Alfred und Raycast, mit lokaler KI über Ollama. Rund 35 MB im Leerlauf, und nichts verlässt den Rechner.",
  },
  "next-kit": {
    status: "Veröffentlicht",
    desc: "Ein interaktives CLI, das aus über zwanzig Installern eine Next.js-App aufsetzt: Auth, ORM, E-Mail, Zahlungen, API-Schicht, Analytics und UI. Auf npm veröffentlicht.",
  },
  dotfiles: {
    kind: "Konfiguration",
    status: "Öffentlich",
    desc: "Mein macOS-Setup mit einem Befehl: zsh, Neovim, tmux, Ghostty und ein yabai-Tiling-Desktop in einem Theme. Dry-Run, Backups und eine Deinstallation machen das Ausprobieren sicher.",
  },
  portfolio: {
    status: "Diese Seite",
    desc: "Diese Seite: helles und dunkles Theme, CSS-first-Animationen, eine typisierte Inhaltsquelle mit Schema-Prüfung und Tastaturnavigation in Listen.",
  },
};

export const ROLES_DE: Record<
  string,
  { date?: string; place?: string; title: string; summary: string; points: string[]; path?: string[] }
> = {
  HealthEdge: {
    date: "Jan 2025 — heute",
    title: "Developer I, Software Engineering",
    summary:
      "Spring-Boot- und Spring-Batch-Microservices für ETL von Transaktionen im Gesundheitswesen, dazu eine Angular-Anwendung. 100 % Testabdeckung. Zweimal Shining Star Award.",
    points: [
      "Ich baue Spring-Boot- und Spring-Batch-Microservices, die ETL über Transaktionen im Gesundheitswesen ausführen.",
      "Einer der wenigen Kernentwickler im Team. Ich arbeite in allen Modulen und behebe Produktionsfehler schnell.",
      "Ich liefere Kundenanforderungen pünktlich, mit Unit- und Integrationstests in allen vier Modulen (JUnit, Mockito, MockMvc, Testcontainers).",
      "Ich habe alle Java-Services und die Angular-Anwendung auf 100 % Testabdeckung gebracht.",
      "Ich habe die Angular-Anwendung optimiert, indem ich den Build neu aufgebaut und Framework-Best-Practices angewendet habe.",
      "Ich habe die Java-Services auf dieselbe Weise getunt und optimierte Spring-Batch-Services für mehrere Kunden gebaut.",
      "Zweimal den Shining Star Award erhalten, für pünktliche Lieferung, erfüllte Kundenerwartungen und Zuverlässigkeit.",
    ],
    path: ["HealthProof wurde mit HealthEdge zusammengeführt", "Die Tochtergesellschaft wurde ein eigenes Unternehmen", "Wechsel in die Healthcare-Tochter als Entwickler", "Vier Monate Training, bevor ich ins Team kam"],
  },
  Matlync: {
    title: "Full-Stack-Next.js-Entwickler",
    summary: "Ein CRM für eine Boutique: Next.js im Frontend, Strapi im Backend.",
    points: ["Ein CRM-Webanwendung für eine Boutique gebaut, vom Frontend bis zum Backend.", "Next.js-Frontend auf einem Strapi-Headless-CMS, mit Inhaltsmodell und REST-APIs in Strapi."],
  },
  "STEAM Troops Innovation Labs": {
    title: "Full-Stack-Next.js-Entwickler",
    summary: "Ein vollständiges Lernmanagementsystem, auf AWS mit CI/CD deployt.",
    points: [
      "Ein voll funktionsfähiges Lernmanagementsystem mit Next.js, shadcn/ui und Tailwind CSS gebaut.",
      "Authentifizierung mit NextAuth und ein REST-API-Backend ergänzt.",
      "Mit Docker verpackt und über eine GitHub-Actions-CI/CD-Pipeline auf AWS deployt.",
    ],
  },
  Systech: {
    title: "Praktikant, Hardware und Netzwerktechnik",
    summary: "Hardware und Netzwerktechnik, geschult am CCNA- und CCNP-Lehrplan.",
    points: ["Praktische Arbeit mit Computerhardware und Netzwerkaufbau.", "Geschult am CCNA- und CCNP-Lehrplan: Routing, Switching und Subnetting."],
  },
};

export const EDUCATION_DE: Record<string, { degree: string; note?: string }> = {
  "Rajalakshmi Engineering College": { degree: "B.Tech, Informatik und Wirtschaftssysteme", note: "GPA 7,98 / 10" },
};

export const SKILL_GROUPS_DE: Record<string, string> = {
  Languages: "Sprachen",
  Backend: "Backend",
  Frontend: "Frontend",
  Data: "Daten",
  "Cloud and delivery": "Cloud und Delivery",
  Testing: "Testen",
  Networking: "Netzwerke",
  Workflow: "Workflow",
};

export const CERTS_DE: Record<string, { about: string; title?: string }> = {
  "aws-cloud-foundations": { about: "Zentrale AWS-Dienste, Cloud-Architektur und das Modell der geteilten Verantwortung." },
  "oracle-plsql": { title: "Datenbankprogrammierung mit PL/SQL", about: "Stored Procedures, Funktionen, Packages und Trigger in PL/SQL." },
  "oracle-sql": { title: "Datenbankprogrammierung mit SQL", about: "Relationaler Entwurf sowie SQL-Abfragen, Joins und Datendefinition." },
  "cpp-beginner-to-beyond": { about: "C++-Grundlagen bis zur objektorientierten Programmierung und Standardbibliothek." },
  "web-dev-bootcamp-2020": { about: "HTML, CSS, JavaScript, Node.js, Express und Datenbanken, von Anfang bis Ende." },
  "r-programming-az": { about: "Datenaufbereitung, Visualisierung und Statistik in R." },
  "dsa-cpp-2023": { about: "Arrays, verkettete Listen, Bäume, Graphen, Sortieren, Rekursion und dynamische Programmierung in C++." },
  "systech-internship": { title: "Praktikum: Hardware und Netzwerktechnik", about: "Zweiwöchiges Praktikum, 4. bis 19. Januar 2023: Hardware- und Netzwerkaufbau." },
  "google-git-github": { about: "Versionskontrolle mit Git und Zusammenarbeit auf GitHub." },
  "modern-react-redux-2023": { about: "React, Hooks, Redux und Redux Toolkit mit echten Projekten." },
  "nextjs-blog-project": { about: "Ein vollständiger Next.js-Blog: Auth, Datenbank, UI-Komponenten." },
};
