import { NavLink, Project, SocialLink, WorkExperience } from "./types";

export const PROJECTS: Project[] = [
  {
    id: "dotfiles",
    title: "dotfiles",
    description:
      "a personal development setup for keeping editor, shell, and tooling workflows fast and reproducible.",
    features: [
      "custom dev environment",
      "optimized cli workflows",
      "config automation",
    ],
    githubLink: "https://github.com/maarcusrenierol/dotfiles",
    hostedLink: "",
    startDate: "2024-06-03",
    endDate: null,
    isOngoing: true,
    category: "miscellaneous",
    skills: ["lua", "yml", "toml"],
  },
  {
    id: "next-cli",
    title: "next-cli",
    description:
      "a project scaffolding cli for bootstrapping opinionated next.js apps with the tools i reach for most.",
    features: [
      "powerful project scaffolding tool built on top of the next.js framework",
      "helps developers bootstrap full-featured web applications in seconds",
    ],
    githubLink: "https://github.com/maarcusrenierol/next-cli",
    hostedLink: "",
    startDate: "2024-09-19",
    endDate: null,
    isOngoing: true,
    category: "full stack",
    skills: ["next.js", "tailwind css", "shadcn ui"],
    highlight: true,
  },
  {
    id: "portfolio",
    title: "portfolio",
    description:
      "this portfolio: a minimal, keyboard-friendly space for projects, writing, work, and live presence.",
    features: [],
    githubLink: "https://github.com/maarcusrenierol/portfolio",
    hostedLink: "https://maarcus.dev",
    startDate: "2024-07-18",
    endDate: null,
    isOngoing: true,
    category: "front end",
    skills: ["next.js", "tailwind css", "shadcn ui"],
  },
  {
    id: "zentro",
    title: "zentro",
    description:
      "a multi-tenant collaboration platform exploring workspaces, boards, permissions, and activity flows.",
    features: [
      "building a multi-tenant collaboration platform.",
      "designed scalable organization, workspace, membership, and permission models to support multi-tenant access control.",
      "building a modular backend workflows for boards, tasks, notifications, and collaborative activity tracking.",
    ],
    githubLink: "https://github.com/maarcusrenierol/zentro",
    hostedLink: "",
    startDate: "2024-07-18",
    endDate: null,
    isOngoing: true,
    category: "front end",
    skills: [
      "next.js",
      "tailwind css",
      "shadcn ui",
      "trpc",
      "zod",
      "resend",
      "drizzle orm",
      "typescript",
      "postgresql",
      "react hook form",
      "uploadthing",
      "upstash redis",
    ],
    highlight: true,
  },
];

export const WORK_EXPERIENCES: WorkExperience[] = [
  {
    id: 1,
    title: "hardware and network engineering intern",
    company: "systech",
    href: "https://systech.com",
    duration: "jan 2023 - feb 2023",
    highlights: [
      "completed ccna and ccnp certifications.",
      "applied theoretical knowledge to configure and troubleshoot network devices.",
      "showcased hands-on expertise in optimizing network performance.",
    ],
    skills: [
      "networking",
      "ccna",
      "ccnp",
      "network configuration",
      "troubleshooting",
    ],
  },
  {
    id: 2,
    title: "full stack developer intern",
    company: "steam troops innovation labs",
    href: "https://steamtroops.com/",
    duration: "aug 2023 - dec 2023",
    highlights: [
      "played a pivotal role in the company’s first product development using next.js, typescript, tailwind css, and strapi.",
      "managed daily sprints and collaborated closely with cross-functional teams.",
      "contributed across the full stack in a fast-paced startup environment.",
    ],
    skills: [
      "next.js",
      "typescript",
      "tailwind css",
      "strapi",
      "next-auth",
      "shadcn ui",
      "prisma",
      "postgresql",
      "aws",
      "docker",
    ],
  },
  {
    id: 3,
    title: "full stack developer intern",
    company: "matlync",
    href: "https://matlync.com/",
    duration: "jan 2024 - feb 2024",
    highlights: [
      "coordinated with teams on multiple ongoing projects.",
      "worked extensively with strapi cms, postbytz, and next.js.",
      "handled iterative testing, debugging, and issue resolution across modules.",
    ],
    skills: [
      "next.js",
      "typescript",
      "tailwind css",
      "strapi",
      "postbytz",
      "three js",
    ],
  },
  {
    id: 4,
    title: "developer 1 - software engineering",
    company: "ust healthproof",
    href: "https://systech.com",
    duration: "jan 2025 - present",
    highlights: [
      "building a new internal project from the ground up.",
      "collaborating with cross-functional teams to design and implement scalable solutions.",
      "focusing on clean architecture, maintainability, and performance.",
    ],
    skills: [
      "angular",
      "typescript",
      "java",
      "spring boot",
      "mysql server",
      "aws",
      "spring batch",
      "spring data jpa",
    ],
  },
];

export const LINKS: SocialLink[] = [
  { name: "email", url: "mailto:maarcusreniero.l@gmail.com" },
  { name: "github", url: "https://github.com/maarcusrenierol" },
  { name: "linkedin", url: "https://www.linkedin.com/maarcus-reniero-l" },
];

export const NAV_LINKS: NavLink = ["home", "projects", "blogs"];
