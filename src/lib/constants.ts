import { Project, Skill } from "./types";

export const PROJECTS: Project[] = [
  {
    id: 1,
    title: "Next Auth MasterClass",
    description:
      "Built features like authentication using credentials, and OAuth provider (Google & GitHub), forgot password, email verification, two-factor authentication, user roles, login and register components, role gates, middleware, session and callback extensions, and various hooks and utilities for user and role management.",
    githubLink: "https://github.com/MaarcusRenieroL/next-auth-masterclass",
    hostedLink: "https://next-auth-masterclass-tan.vercel.app/",
    startDate: "05 Jan 2024",
    endDate: "16 Jan 2024",
    category: "Full Stack",
    skills: [
      "Next.js",
      "TypeScript",
      "Next Auth",
      "Tailwind CSS",
      "ShadCN UI",
      "Zod",
      "React Hook Form",
      "Resend",
      "Prisma",
      "PostgreSQL",
    ],
  },
  {
    id: 2,
    title: "E Commerce Admin Dashboard",
    description:
      "Built features like managing multiple vendors/stores, create/update/delete categories and products, manage images and filters, handle billboards, enable search with pagination, control featured products, view orders and sales, and show revenue graphs.",
    githubLink: "https://github.com/MaarcusRenieroL/e-commerce-admin",
    hostedLink: "https://e-commerce-admin-neon-omega.vercel.app",
    startDate: "24 June 2024",
    endDate: "Ongoing",
    category: "Full Stack",
    skills: [
      "Next.js",
      "TypeScript",
      "Next Auth",
      "Tailwind CSS",
      "ShadCN UI",
      "React Hook Form",
      "Zod",
      "tRPC",
      "Prisma",
      "PostgreSQL",
      "Resend",
      "Upload Thing",
    ],
  },
  {
    id: 3,
    title: "Productivity Management Tool",
    description:
      "Implement CRUD for tasks and projects, add relations between projects, tasks, and users, add theme toggle and seed the application with actual data from the database, and invite team members and manage project-specific access",
    githubLink:
      "https://github.com/MaarcusRenieroL/productivity-management-tool",
    hostedLink: "https://productivity-management-tool.vercel.app",
    startDate: "18 June 2024",
    endDate: "Ongoing",
    category: "Full Stack",
    skills: [
      "Next.js",
      "TypeScript",
      "Next Auth",
      "Tailwind CSS",
      "ShadCN UI",
      "tRPC",
      "PostgreSQL",
      "Prisma",
      "React Hook Form",
      "Zod",
    ],
  },
  {
    id: 4,
    title: "Role Based Authentication",
    description: "Built authentication with role based access control feature",
    githubLink: "https://github.com/MaarcusRenieroL/nextjs-rbac",
    hostedLink: "https://next-js-rbac.vercel.app/",
    startDate: "21 Oct 2023",
    endDate: "29 Oct 2023",
    category: "Full Stack",
    skills: [
      "Next.js",
      "TypeScript",
      "Next Auth",
      "Tailwind CSS",
      "ShadCN UI",
      "MongoDB",
      "Prisma",
      "React Hook Form",
      "Zod",
    ],
  },
  {
    id: 5,
    title: "Portfolio",
    description:
      "Crafted a dynamic portfolio showcasing expertise in full stack development.",
    githubLink: "https://github.com/MaarcusRenieroL/portfolio",
    hostedLink: "",
    startDate: "18 Jul 2024",
    endDate: "22 Jul 2024",
    category: "Front End",
    skills: [
      "Next.js",
      "TypeScript",
      "Tailwind CSS",
      "ShadCN UI",
      "Resend",
      "React Hook Form",
      "Zod",
    ],
  },
  {
    id: 6,
    title: "HealthX",
    description:
      "Complete process flow for registration, unique ID assignment, test, clinical details, invoice and billing for IP and OP visits. Delivering information to patients and archiving of visit data.",
    githubLink: "https://github.com/MaarcusRenieroL/healthX",
    hostedLink: "health-x-seven.vercel.app",
    startDate: "1 Nov 2022",
    endDate: "20 Nov 2022",
    category: "Front End",
    skills: ["React JS", "JavaScript", "Tailwind CSS"],
  },
  {
    id: 7,
    title: "Hovirreal",
    description: "Built a website for a startup named Hovirreal",
    githubLink: "https://github.com/MaarcusRenieroL/hovirreal",
    hostedLink: "",
    startDate: "10 Dec 2021",
    endDate: "12 Dec 2021",
    category: "Freelance",
    skills: ["HTML", "CSS", "JS"],
  },
  {
    id: 8,
    title: "List Leap",
    description:
      "Built features like authentication, organization management, board creation with Unsplash API for cover images, and activity logs. Features include renaming and deleting boards, creating and managing lists and cards with drag-and-drop reorder, board limits, and Stripe subscriptions for unlimited boards.",
    githubLink: "https://github.com/MaarcusRenieroL/secure-track",
    hostedLink: "https://list-leap.vercel.app",
    startDate: "16 Feb 2024",
    endDate: "01 Mar 2024",
    category: "Full Stack",
    skills: [
      "Next.js",
      "Server Actions",
      "TypeScript",
      "Tailwind CSS",
      "ShadCN UI",
      "Mongo DB",
      "Unsplash API",
    ],
  },
  {
    id: 9,
    title: "Password Manager",
    description:
      "Built a secure application for managing and storing passwords. Features include encrypted storage, password generation, and user authentication. Designed to enhance security and convenience, this tool helps users keep track of their credentials safely while providing an intuitive interface for easy management and retrieval.",
    githubLink: "https://github.com/MaarcusRenieroL/password-manager",
    hostedLink: "",
    startDate: "8 Jul 2024",
    endDate: "Ongoing",
    category: "Full Stack",
    skills: [
      "Next.js",
      "TypeScript",
      "Next Auth",
      "Tailwind CSS",
      "ShadCN UI",
      "tRPC",
      "PostgreSQL",
      "Prisma",
      "React Hook Form",
      "Zod",
    ],
  },
  {
    id: 10,
    title: "Real Time Chat Application",
    description:
      "A full-stack app featuring authentication, a friends list, and real-time messaging. Users can send and receive messages instantly, manage friend requests, and stay connected through an intuitive interface. Designed for seamless communication and dynamic interactions, ensuring a robust and engaging user experience.",
    githubLink: "https://github.com/MaarcusRenieroL/real-time-chat-app",
    hostedLink: "",
    startDate: "28 Jun 2024",
    endDate: "Ongoing",
    category: "Full Stack",
    skills: [
      "Next.js",
      "Next Auth",
      "ShadCN UI",
      "Tailwind CSS",
      "Upstash Redis",
    ],
  },
  {
    id: 11,
    title: "Duolingo Clone",
    description:
      "Built features like AI voices (ElevenLabs), sound effects, hearts and points/XP systems, popups for no hearts and exit confirmation, practice old lessons to regain hearts, leaderboard, quest milestones, shop for exchanging points for hearts, Pro tier for unlimited hearts (Stripe subscription), landing page, admin dashboard, Drizzle ORM, NeonDB Postgres database, Vercel deployment, cartoonish components with Shadcn UI, and original characters and mascot.",
    githubLink: "https://github.com/MaarcusRenieroL/duolingo-clone",
    hostedLink: "",
    startDate: "24 Apr 2024",
    endDate: "Ongoing",
    category: "Full Stack",
    skills: [
      "Next.js 14",
      "Drizzle ORM",
      "PostgreSQL",
      "Server Actions",
      "Stripe",
      "ShadcnUI",
      "Tailwind CSS",
    ],
  },
  {
    id: 12,
    title: "Dotfiles",
    description:
      "A personalized set of configuration files for optimizing my development environment. This includes custom settings for shell environments, editors, and various tools, enhancing productivity and consistency across applications. Designed to streamline workflows and ensure a tailored, efficient coding experience.",
    githubLink: "https://github.com/MaarcusRenieroL/dotfiles",
    hostedLink: "",
    startDate: "03 Jun 2024",
    endDate: "Ongoing",
    category: "Miscellaneous",
    skills: ["Lua", "YML", "TOML"],
  },
  {
    id: 13,
    title: "Blog",
    description:
      "Building a clean and user-friendly blog featuring recent posts, full content views, categories, search functionality, and social media integration. Includes an about page, contact form, and newsletter signup, all designed with a responsive layout for optimal viewing on any device.",
    githubLink: "https://github.com/MaarcusRenieroL/blog-post",
    hostedLink: "",
    startDate: "19 Aug 2023",
    endDate: "Ongoing",
    category: "Full Stack",
    skills: [
      "Next.js",
      "TypeScript",
      "Next Auth",
      "Taiwlind CSS",
      "ShadCN UI",
      "Prisma",
      "MongoDB",
    ],
  },
  {
    id: 14,
    title: "Threads Clone",
    description:
      "Built features like authentication, onboarding page, fetching posts, thread card structure, replies/comments, and user profile, search, activity, and community pages, API deployment, and final deployment, showcasing a comprehensive web application development process.",
    githubLink: "https://github.com/MaarcusRenieroL/threads-clone",
    hostedLink: "",
    startDate: "12 Aug 2023",
    endDate: "Ongoing",
    category: "Full Stack",
    skills: [
      "Next.js",
      "MongoDB",
      "TailwindCSS",
      "Clerk",
      "UploadThing",
      "Shadcn components",
      "Webhooks",
      "Middleware",
      "Zod",
      "React Hook Form",
      "Vercel",
    ],
  },
  {
    id: 15,
    title: "MERN Socal Media App",
    description:
      "Built a responsive social media application from scratch using the MERN stack. It includes backend setup with Node.js and MongoDB, authentication, user and post routes, and frontend development with React, Redux, and styling, culminating in a fully functional app.",
    githubLink: "https://github.com/MaarcusRenieroL/mern-social-media-app",
    hostedLink: "",
    startDate: "12 Jul 2023",
    endDate: "19 Jul 2023",
    category: "Full Stack",
    skills: ["Node.js", "JavaScript", "MongoDB", "ExpressJS"],
  },
  {
    id: 16,
    title: "MERN Finance Dashboard",
    description:
      "Built a MERN Finance Dashboard App that has Machine Learning Predictions. The frontend will consist of Vite for our starter application, Redux Toolkit for state management, Material UI for our component library, and Recharts for our Charts. For the backend we will be using Node Js as our runtime, Express Js as our backend framework, and MongoDB for our database.",
    githubLink: "https://github.com/MaarcusRenieroL/mern-finance-dashboard",
    hostedLink: "",
    startDate: "10 Jul 2023",
    endDate: "15 Jul 2023",
    category: "Full Stack",
    skills: ["Node.js", "JavaScript", "MongoDB", "ExpressJS"],
  },
  {
    id: 17,
    title: "AyurSeva",
    description:
      "Developed a mobile application to deliver ayurvedic products and meet with doctors for checkups",
    githubLink: "https://github.com/MaarcusRenieroL/ayurseva",
    hostedLink: "",
    startDate: "31 Mar 2023",
    endDate: "19 Apr 2023",
    category: "Miscellaneous",
    skills: ["Flutter", "Dart"],
  },
  {
    id: 18,
    title: "Cryptopass",
    description:
      "Developed a secure password manager using Python. This application features encrypted password storage and a built-in password generator. Designed to simplify credential management, it ensures high security and ease of use, helping users safely store and retrieve their passwords.",
    githubLink: "https://github.com/MaarcusRenieroL/ayurseva",
    hostedLink: "",
    startDate: "22 Oct 2022",
    endDate: "22 Oct 2022",
    category: "Miscellaneous",
    skills: ["Python"],
  },
  {
    id: 19,
    title: "EDA on top 1000 movies",
    description:
      "Conducted a detailed exploratory data analysis on the top 1000 movies, uncovering insights into trends, ratings, genres, and box office performance. The analysis highlights patterns and correlations, providing a comprehensive overview of the film industry’s most successful and influential titles.",
    githubLink: "https://github.com/MaarcusRenieroL/EDA-on-top-1000-movies",
    hostedLink: "",
    startDate: "16 Feb 2022",
    endDate: "16 Feb 2022",
    category: "Miscellaneous",
    skills: ["Python"],
  },
  {
    id: 20,
    title: "The Glam Model Agency Website",
    description:
      "Revamped their previous landing page to Shopify with HTML, CSS, JS and Liquid",
    githubLink: "https://github.com/anonymous-sherlock/the-glam-model",
    hostedLink: "https://theglammodel.com",
    startDate: "16 Feb 2022",
    endDate: "16 Feb 2022",
    category: "Miscellaneous",
    skills: ["Python"],
  },
];

export const SKILLS: Skill[] = [
  {
    id: 1,
    title: "HTML",
    category: "Front End",
    imageUrl: "/skill-logos/html.png",
  },
  {
    id: 2,
    title: "CSS",
    category: "Front End",
    imageUrl: "/skill-logos/css.png",
  },
  {
    id: 3,
    title: "JavaScript",
    category: "Programming Language",
    imageUrl: "/skill-logos/javascript.png",
  },
  {
    id: 4,
    title: "TypeScript",
    category: "Programming Language",
    imageUrl: "/skill-logos/typescript.png",
  },
  {
    id: 5,
    title: "React JS",
    category: "Front End",
    imageUrl: "/skill-logos/reactjs.png",
  },
  {
    id: 6,
    title: "Next.js",
    category: "Front End",
    imageUrl: "/skill-logos/nextjs.png",
  },
  {
    id: 7,
    title: "Tailwind CSS",
    category: "Front End",
    imageUrl: "/skill-logos/tailwindcss.png",
  },
  {
    id: 8,
    title: "tRPC",
    category: "Back End",
    imageUrl: "/skill-logos/trpc.png",
  },
  {
    id: 9,
    title: "Prisma",
    category: "Back End",
    imageUrl: "/skill-logos/prisma.png",
  },
  {
    id: 10,
    title: "Drizzle ORM",
    category: "Back End",
    imageUrl: "/skill-logos/drizzle.png",
  },
  {
    id: 11,
    title: "MySQL",
    category: "Database",
    imageUrl: "/skill-logos/mysql.png",
  },
  {
    id: 12,
    title: "Mongo DB",
    category: "Database",
    imageUrl: "/skill-logos/mongodb.png",
  },
  {
    id: 13,
    title: "PostgreSQL",
    category: "Database",
    imageUrl: "/skill-logos/postgres.png",
  },
  {
    id: 14,
    title: "Java",
    category: "Programming Language",
    imageUrl: "/skill-logos/java.png",
  },
  {
    id: 15,
    title: "Git",
    category: "Miscellaneous",
    imageUrl: "/skill-logos/git.png",
  },
  {
    id: 16,
    title: "Figma",
    category: "Tools",
    imageUrl: "/skill-logos/figma.png",
  },
  {
    id: 17,
    title: "Postman",
    category: "Tools",
    imageUrl: "/skill-logos/postman.png",
  },
  {
    id: 18,
    title: "Insomnia",
    category: "Tools",
    imageUrl: "/skill-logos/insomnia.png",
  },
  {
    id: 19,
    title: "Vercel",
    category: "Miscellaneous",
    imageUrl: "/skill-logos/vercel.png",
  },
  {
    id: 20,
    title: "GitKraken",
    category: "Tools",
    imageUrl: "/skill-logos/gitkraken.png",
  },
  {
    id: 21,
    title: "Strapi",
    category: "Miscellaneous",
    imageUrl: "/skill-logos/strapi.png",
  },
  {
    id: 22,
    title: "Neovim",
    category: "Tools",
    imageUrl: "/skill-logos/neovim.png",
  },
  {
    id: 23,
    title: "VS Code",
    category: "Tools",
    imageUrl: "/skill-logos/vscode.png",
  },
  {
    id: 24,
    title: "JetBrains",
    category: "Tools",
    imageUrl: "/skill-logos/jetbrains.png",
  },
  {
    id: 25,
    title: "Netlify",
    category: "Miscellaneous",
    imageUrl: "/skill-logos/netlify.png",
  },
  {
    id: 26,
    title: "Redis",
    category: "Database",
    imageUrl: "/skill-logos/redis.png",
  },
];
