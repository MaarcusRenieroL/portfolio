import { PROJECTS, STACK_GROUPS } from "../constants";
import { SearchDoc } from "../types";
import { getPosts } from "./blog";

const PAGE_DOCS: SearchDoc[] = [
  {
    id: "page-home",
    title: "home",
    description: "who i am, current role, and the strongest proof points.",
    href: "/",
    group: "pages",
    keywords: "start landing index",
  },
  {
    id: "page-projects",
    title: "projects",
    description: "active builds, experiments, and tools that shaped how i work.",
    href: "/projects",
    group: "pages",
    keywords: "work portfolio builds archive",
  },
  {
    id: "page-blog",
    title: "blog",
    description: "notes on building, debugging, and learning in public.",
    href: "/blog",
    group: "pages",
    keywords: "posts writing articles",
  },
  {
    id: "page-about",
    title: "about",
    description: "the person behind the repos.",
    href: "/about",
    group: "pages",
    keywords: "bio identity person",
  },
  {
    id: "page-stack",
    title: "stack",
    description: "the tools i use and the edges i am actively sharpening.",
    href: "/stack",
    group: "pages",
    keywords: "tools technologies skills",
  },
  {
    id: "page-contact",
    title: "contact",
    description: "reach out for full-stack work, product builds, or collaborations.",
    href: "/contact",
    group: "pages",
    keywords: "email message hire reach",
  },
  {
    id: "page-resume",
    title: "resume",
    description: "preview or download the pdf resume.",
    href: "/resume",
    group: "pages",
    keywords: "cv pdf download hire",
  },
];

export function buildSearchIndex(): SearchDoc[] {
  const projectDocs: SearchDoc[] = PROJECTS.map((project) => ({
    id: `project-${project.id}`,
    title: project.title,
    description: project.description,
    href: `/projects/${project.id}`,
    group: "projects",
    keywords: `${project.category} ${project.status} ${project.skills.join(" ")} ${project.features.join(" ")}`,
  }));

  const blogDocs: SearchDoc[] = getPosts().map((post) => ({
    id: `blog-${post.slug}`,
    title: post.title,
    description: post.description,
    href: `/blog/${post.slug}`,
    group: "blog",
    keywords: post.tags.join(" "),
  }));

  const stackDocs: SearchDoc[] = STACK_GROUPS.map((group) => ({
    id: `stack-${group.title}`,
    title: group.title,
    description: group.items.join(", "),
    href: "/stack",
    group: "stack",
    keywords: `${group.eyebrow} ${group.items.join(" ")}`,
  }));

  return [...PAGE_DOCS, ...projectDocs, ...blogDocs, ...stackDocs];
}
