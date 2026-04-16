import { NavLink, Project, SocialLink, WorkExperience } from "./types";

export const PROJECTS: Project[] = [
  {
    id: "next-auth-masterclass",
    title: "next auth masterclass",
    features: [
      "authentication using credentials and oauth (google & github)",
      "forgot password and email verification",
      "two-factor authentication (2fa)",
      "user roles and access gates",
      "middleware and session callbacks"
    ],
    githubLink: "https://github.com/maarcusrenierol/next-auth-masterclass",
    hostedLink: "https://next-auth-masterclass-tan.vercel.app/",
    startDate: "2024-01-05",
    endDate: "2024-01-16",
    isOngoing: false,
    category: "full stack",
    skills: [
      "next.js", "typescript", "next auth", "tailwind css", "shadcn ui",
      "zod", "react hook form", "resend", "prisma", "postgresql", "vercel"
    ],
    hightlight: true
  },

  {
    id: "e-commerce-admin",
    title: "e commerce admin dashboard",
    features: [
      "multi-store/vendor management",
      "product, category, and billboard crud",
      "image uploads and asset management",
      "filters, search, pagination",
      "sales analytics and revenue tracking"
    ],
    githubLink: "https://github.com/maarcusrenierol/e-commerce-admin",
    hostedLink: "https://e-commerce-admin-neon-omega.vercel.app",
    startDate: "2024-06-24",
    endDate: null,
    isOngoing: true,
    category: "full stack",
    skills: [
      "next.js", "typescript", "next auth", "tailwind css", "shadcn ui",
      "react hook form", "zod", "trpc", "prisma", "postgresql", "resend", "uploadthing", "vercel"
    ],
  },

  {
    id: "productivity-management-tool",
    title: "productivity management tool",
    features: [
      "task and project crud",
      "relational data modeling",
      "team collaboration and access control",
      "theme support and seeded data"
    ],
    githubLink: "https://github.com/maarcusrenierol/productivity-management-tool",
    hostedLink: "https://productivity-management-tool.vercel.app",
    startDate: "2024-06-18",
    endDate: null,
    isOngoing: true,
    category: "full stack",
    skills: [
      "next.js", "typescript", "next auth", "tailwind css", "shadcn ui",
      "trpc", "postgresql", "prisma", "react hook form", "zod", "vercel"
    ],
    hightlight: true
  },

  {
    id: "list-leap",
    title: "list leap",
    features: [
      "board and card management",
      "drag and drop reordering",
      "unsplash integration",
      "activity logs",
      "stripe subscriptions"
    ],
    githubLink: "https://github.com/maarcusrenierol/secure-track",
    hostedLink: "https://list-leap.vercel.app",
    startDate: "2024-02-16",
    endDate: "2024-03-01",
    isOngoing: false,
    category: "full stack",
    skills: [
      "next.js", "server actions", "typescript", "tailwind css",
      "shadcn ui", "mongodb", "unsplash api", "stripe", "vercel"
    ],
    hightlight: true
  },

  {
    id: "password-manager",
    title: "password manager",
    features: [
      "secure password storage",
      "password generator",
      "authentication system",
      "clean ui"
    ],
    githubLink: "https://github.com/maarcusrenierol/password-manager",
    hostedLink: "",
    startDate: "2024-07-08",
    endDate: null,
    isOngoing: true,
    category: "full stack",
    skills: [
      "next.js", "typescript", "next auth", "tailwind css",
      "shadcn ui", "trpc", "postgresql", "prisma", "react hook form", "zod"
    ],
  },

  {
    id: "real-time-chat-app",
    title: "real time chat application",
    features: [
      "real-time messaging",
      "friend system",
      "instant updates",
      "auth flow"
    ],
    githubLink: "https://github.com/maarcusrenierol/real-time-chat-app",
    hostedLink: "",
    startDate: "2024-06-28",
    endDate: null,
    isOngoing: true,
    category: "full stack",
    skills: [
      "next.js", "next auth", "shadcn ui", "tailwind css", "upstash redis"
    ],
  },

  {
    id: "duolingo-clone",
    title: "duolingo clone",
    features: [
      "gamified learning system",
      "xp, hearts, leaderboard",
      "stripe subscriptions",
      "admin dashboard"
    ],
    githubLink: "https://github.com/maarcusrenierol/duolingo-clone",
    hostedLink: "",
    startDate: "2024-04-24",
    endDate: null,
    isOngoing: true,
    category: "full stack",
    skills: [
      "next.js", "drizzle orm", "postgresql", "server actions",
      "stripe", "shadcn ui", "tailwind css"
    ],
  },

  {
    id: "threads-clone",
    title: "threads clone",
    features: [
      "post and thread system",
      "authentication and onboarding",
      "activity and search",
      "community features"
    ],
    githubLink: "https://github.com/maarcusrenierol/threads-clone",
    hostedLink: "",
    startDate: "2024-12-22",
    endDate: null,
    isOngoing: true,
    category: "full stack",
    skills: [
      "next.js", "mongodb", "tailwind css", "clerk", "uploadthing",
      "webhooks", "middleware", "zod", "react hook form", "vercel"
    ],
  },

  {
    id: "dotfiles",
    title: "dotfiles",
    features: [
      "custom dev environment",
      "optimized cli workflows",
      "config automation"
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
    id: "hovirreal",
    title: "hovirreal",
    features: [
      "startup website",
      "responsive design",
      "vanilla implementation"
    ],
    githubLink: "https://github.com/maarcusrenierol/hovirreal",
    hostedLink: "",
    startDate: "2021-12-10",
    endDate: "2021-12-12",
    isOngoing: false,
    category: "freelance",
    skills: ["html", "css", "js"],
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
      "Completed CCNA and CCNP certifications.",
      "Applied theoretical knowledge to configure and troubleshoot network devices.",
      "Showcased hands-on expertise in optimizing network performance.",
    ],
    skills: ["networking", "ccna", "ccnp", "network configuration", "troubleshooting"],
  },
  {
    id: 2,
    title: "full stack developer intern",
    company: "steam troops innovation labs",
    href: "https://steamtroops.com/",
    duration: "aug 2023 - dec 2023",
    highlights: [
      "Played a pivotal role in the company’s first product development using Next.js, TypeScript, Tailwind CSS, and Strapi.",
      "Managed daily sprints and collaborated closely with cross-functional teams.",
      "Contributed across the full stack in a fast-paced startup environment.",
    ],
    skills: ["next.js", "typescript", "tailwind css", "strapi", "next-auth", "shadcn ui", "prisma", "postgresql", "aws", "docker"],
  },
  {
    id: 3,
    title: "full stack developer intern",
    company: "matlync",
    href: "https://matlync.com/",
    duration: "jan 2024 - feb 2024",
    highlights: [
      "Coordinated with teams on multiple ongoing projects.",
      "Worked extensively with Strapi CMS, Postbytz, and Next.js.",
      "Handled iterative testing, debugging, and issue resolution across modules.",
    ],
    skills: ["next.js", "typescript", "tailwind css", "strapi", "postbytz", "three js"],
  },
  {
    id: 4,
    title: "developer 1 - software engineering",
    company: "ust healthproof",
    href: "https://systech.com",
    duration: "jan 2025 - present",
    highlights: [
      "Building a new internal project from the ground up.",
      "Collaborating with cross-functional teams to design and implement scalable solutions.",
      "Focusing on clean architecture, maintainability, and performance.",
    ],
    skills: ["angular", "typescript", "java", "spring boot", "mysql server"],
  },
];

export const LINKS: SocialLink[] = [
  { name: "email", url: "mailto:maarcusreniero.l@gmail.com" },
  { name: "github", url: "https://github.com/maarcusrenierol" },
  { name: "linkedin", url: "https://www.linkedin.com/maarcus-reniero-l" },
]

export const NAV_LINKS: NavLink = [
  "home", "projects", "blogs"
]
