import { isLibraryRef } from "./media";

/**
 * Site constants and asset URL helpers with no dependencies, so client components can import them
 * without pulling in the content data and its zod schemas. `content.ts` re-exports all of this.
 */

export const SITE = {
  name: "Maarcus Reniero L",
  domain: "maarcus.dev",
  url: "https://maarcus.dev",
  email: "maarcusreniero.l@gmail.com",
  github: "https://github.com/MaarcusRenieroL",
  linkedin: "https://linkedin.com/in/maarcusrenierol",
  spotify: "https://open.spotify.com/user/gbhksdf6fftplg6sg6und5bq8",
  discord: "https://discord.com/users/1363042192343699536",
  location: "Chennai, IN",
  /** Optional booking link (Cal.com etc.), set NEXT_PUBLIC_CAL_URL to show it. */
  call: process.env.NEXT_PUBLIC_CAL_URL || "",
  open: "Looking for a full-time remote or hybrid role in Germany, Bangalore or Chennai. Open to freelance work too.",
};

export const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/experience", label: "Experience" },
  { href: "/projects", label: "Projects" },
  { href: "/skills", label: "Skills" },
  { href: "/certifications", label: "Certifications" },
  { href: "/blog", label: "Writing" },
  { href: "/notes", label: "Notes" },
  { href: "/resume", label: "Resume" },
  { href: "/contact", label: "Contact" },
] as const;

/** A library path (`/media/...`) or URL as-is, otherwise a file under /public. Plain <img> tags don't get Next's basePath. */
const lib = (file: string) => (file.startsWith("/") ? `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}${file}` : file);

/** Folder on the assets domain → folder under /public, for when the assets domain isn't set (local dev). */
const LOCAL_FOLDER = { projects: "projects", certifications: "certificates", logos: "logos", files: "" } as const;
export type AssetFolder = keyof typeof LOCAL_FOLDER;

/**
 * A site file: https://assets.maarcus.dev/<folder>/<path> when NEXT_PUBLIC_ASSETS_URL is set, otherwise the
 * same file under /public. `files` is the root (résumé). Run `pnpm assets:upload` after adding files.
 */
export function assetUrl(folder: AssetFolder, path: string): string {
  const base = (process.env.NEXT_PUBLIC_ASSETS_URL ?? "").replace(/\/+$/, "");
  const clean = path.replace(/^\/+/, "");
  if (base) return `${base}/${folder === "files" ? "" : `${folder}/`}${clean}`;
  const local = LOCAL_FOLDER[folder];
  return `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/${local ? `${local}/` : ""}${clean}`;
}

export const shotUrl = (slug: string, file: string) => (isLibraryRef(file) ? lib(file) : assetUrl("projects", `${slug}/${file}`));

/** A role's logo: a media-library path or URL as-is, or a file name under logos/. */
export const logoUrl = (file: string) => (isLibraryRef(file) ? lib(file) : assetUrl("logos", file));

/** Certificate files: a media-library path or URL as-is, or a file name under certifications/. */
export const certAsset = (file: string) => (isLibraryRef(file) ? lib(file) : assetUrl("certifications", file));

export const CATEGORIES: [string, string][] = [
  ["all", "All"],
  ["backend", "Backend"],
  ["frontend", "Frontend"],
  ["ai", "AI"],
  ["systems", "Systems"],
  ["tooling", "Tooling"],
];
