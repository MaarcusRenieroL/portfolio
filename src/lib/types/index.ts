export type Project = {
  id: string;
  title: string;
  description: string;
  features: string[];
  githubLink: string;
  hostedLink: string;
  startDate: string;
  endDate: string | null;
  isOngoing: boolean;
  category: Category;
  skills: Skill[];
  /** optional screenshot/preview, e.g. "/projects/zentro.png" in /public */
  image?: string;
  highlight?: boolean;
  status: "active" | "maintained" | "shipped" | "archived";
  role: string;
  impact: string;
  challenge: string;
  approach: string[];
  outcome: string[];
  decisions: string[];
  lessons: string[];
  nextSteps: string[];
  preview: "terminal" | "dashboard" | "editor" | "system";
};

export type WorkExperience = {
  id: number;
  title: string;
  company: string;
  href: string;
  startDate: string;
  endDate: string | null;
  isOngoing: boolean;
  highlights: string[];
  skills: string[];
};

export type SocialLink = {
  name: string;
  url: string;
};

export type NavLink = string[];

export type StackGroup = {
  title: string;
  eyebrow: string;
  items: string[];
};

export type Category =
  | "full stack"
  | "front end"
  | "miscellaneous"
  | "freelance";

export type Skill =
  | "next.js"
  | "typescript"
  | "next auth"
  | "tailwind css"
  | "shadcn ui"
  | "zod"
  | "react hook form"
  | "resend"
  | "prisma"
  | "postgresql"
  | "trpc"
  | "uploadthing"
  | "html"
  | "css"
  | "js"
  | "server actions"
  | "mongodb"
  | "unsplash api"
  | "upstash redis"
  | "drizzle orm"
  | "stripe"
  | "lua"
  | "yml"
  | "toml"
  | "clerk"
  | "webhooks"
  | "middleware"
  | "vercel"
  | "node.js"
  | "javascript"
  | "expressjs"
  | "liquid"
  | "shopify";
