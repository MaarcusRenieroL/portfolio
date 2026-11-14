import type { Kind } from "./server/store";

/** How each kind of content is edited. Shared by the form (client) and the actions (server). */
export type FieldType = "text" | "textarea" | "url" | "number" | "bool" | "select" | "date" | "tags" | "lines" | "cats" | "markdown" | "steps";
export type Field = {
  name: string;
  label: string;
  type: FieldType;
  help?: string;
  options?: string[];
  /** Has a German version that can be edited and machine-translated. */
  de?: boolean;
};

export type KindSpec = {
  label: string;
  plural: string;
  /** The field that names the item and is its permanent key. */
  keyField: string;
  /** Field shown as the item's title in lists. */
  titleField: string;
  fields: Field[];
  /** Public path that shows this item, for the live preview. */
  preview: (key: string) => string;
};

const CATS = ["backend", "frontend", "ai", "systems", "tooling"];

export const SPECS: Record<Kind, KindSpec> = {
  project: {
    label: "Project",
    plural: "Projects",
    keyField: "slug",
    titleField: "name",
    preview: () => "/projects",
    fields: [
      { name: "slug", label: "Slug", type: "text", help: "Lowercase letters, numbers, dashes. Can not change later." },
      { name: "name", label: "Name", type: "text" },
      { name: "kind", label: "Kind", type: "text", de: true, help: "e.g. macOS app, CLI" },
      { name: "status", label: "Status", type: "text", de: true },
      { name: "desc", label: "Description", type: "textarea", de: true },
      { name: "skills", label: "Skills", type: "tags", help: "Comma separated, strongest first." },
      { name: "cats", label: "Categories", type: "cats", options: CATS },
      { name: "featured", label: "Featured", type: "bool" },
      { name: "hidden", label: "Hidden from the site", type: "bool" },
      { name: "site", label: "Live URL", type: "url" },
      { name: "github", label: "GitHub URL", type: "url" },
      { name: "cover", label: "Cover file", type: "text", help: "File in /public/projects/<slug>/" },
    ],
  },
  role: {
    label: "Role",
    plural: "Experience",
    keyField: "org",
    titleField: "org",
    preview: () => "/experience",
    fields: [
      { name: "org", label: "Company", type: "text", help: "Can not change later." },
      { name: "title", label: "Job title", type: "text", de: true },
      { name: "date", label: "Dates", type: "text", de: true, help: "e.g. Jan 2025 — Present" },
      { name: "place", label: "Place", type: "text" },
      { name: "url", label: "Company URL", type: "url" },
      { name: "logo", label: "Logo file", type: "text", help: "File in /public/logos/" },
      { name: "logoOn", label: "Logo tile", type: "select", options: ["", "light", "dark"] },
      { name: "now", label: "Current role", type: "bool" },
      { name: "summary", label: "Summary", type: "textarea", de: true },
      { name: "points", label: "Highlights", type: "lines", de: true, help: "One per line." },
      { name: "tags", label: "Tags", type: "tags" },
      { name: "path", label: "Company renames", type: "steps", de: true, help: "Same job under earlier company names, newest first." },
    ],
  },
  education: {
    label: "Education",
    plural: "Education",
    keyField: "school",
    titleField: "school",
    preview: () => "/experience",
    fields: [
      { name: "school", label: "School", type: "text", help: "Can not change later." },
      { name: "degree", label: "Degree", type: "text", de: true },
      { name: "date", label: "Dates", type: "text" },
      { name: "place", label: "Place", type: "text" },
      { name: "note", label: "Note", type: "textarea", de: true },
      { name: "url", label: "URL", type: "url" },
    ],
  },
  skillgroup: {
    label: "Skill group",
    plural: "Skills",
    keyField: "name",
    titleField: "name",
    preview: () => "/skills",
    fields: [
      { name: "name", label: "Group name", type: "text", de: true, help: "Can not change later." },
      { name: "items", label: "Skills", type: "tags", help: "Comma separated." },
    ],
  },
  certificate: {
    label: "Certificate",
    plural: "Certificates",
    keyField: "slug",
    titleField: "title",
    preview: () => "/certifications",
    fields: [
      { name: "slug", label: "Slug", type: "text", help: "Can not change later." },
      { name: "title", label: "Title", type: "text", de: true },
      { name: "issuer", label: "Issuer", type: "text" },
      { name: "date", label: "Issued", type: "date" },
      { name: "hours", label: "Hours", type: "number" },
      { name: "instructors", label: "Instructors", type: "text" },
      { name: "about", label: "What it covered", type: "textarea", de: true },
      { name: "preview", label: "Preview image file", type: "text", help: "File in /public/certificates/" },
      { name: "file", label: "Certificate file", type: "text", help: "PDF or image in /public/certificates/" },
      { name: "verify", label: "Verification URL", type: "url" },
    ],
  },
  post: {
    label: "Post",
    plural: "Blog",
    keyField: "slug",
    titleField: "title",
    preview: (key) => `/blog/${key}`,
    fields: [
      { name: "slug", label: "Slug", type: "text", help: "Can not change later." },
      { name: "title", label: "Title", type: "text", de: true },
      { name: "description", label: "Summary", type: "textarea", de: true },
      { name: "date", label: "Date", type: "date" },
      { name: "tags", label: "Tags", type: "tags" },
      { name: "body", label: "Body", type: "markdown", de: true },
    ],
  },
  note: {
    label: "Note",
    plural: "Notes",
    keyField: "slug",
    titleField: "title",
    preview: (key) => `/notes/${key}`,
    fields: [
      { name: "slug", label: "Slug", type: "text", help: "Can not change later." },
      { name: "title", label: "Title", type: "text", de: true },
      { name: "description", label: "Summary", type: "textarea", de: true },
      { name: "date", label: "Date", type: "date" },
      { name: "tags", label: "Tags", type: "tags" },
      { name: "body", label: "Body", type: "markdown", de: true },
    ],
  },
};

export const deFields = (kind: Kind) => SPECS[kind].fields.filter((f) => f.de);
