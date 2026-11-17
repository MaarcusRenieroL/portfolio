/**
 * Media rules shared by the upload route, the server actions and the admin UI.
 * Uploaded files live in Cloudflare R2; content fields store their /media/<name> path.
 */

export const IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp", "image/avif", "image/gif", "image/svg+xml"] as const;
export const FILE_TYPES = [...IMAGE_TYPES, "application/pdf"] as const;
export const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;

export type MediaAccept = "image" | "file";

export type MediaItem = {
  id: number;
  url: string;
  pathname: string;
  content_type: string;
  size: number;
  width: number | null;
  height: number | null;
  alt: string;
  created_at: string;
};

export const isImage = (type: string) => type.startsWith("image/");

/**
 * Where a library file is referenced in content: `/media/<name>`. Drafts load it from the private bucket through
 * that route; live content is pointed at the public assets domain once published.
 */
export const mediaSrc = (m: { pathname: string }) => `/media/${m.pathname.replace(/^media\//, "")}`;

/** A content field holds either a legacy file name (resolved under /public) or a library path or URL, used as-is. */
export const isLibraryRef = (value: string) => value.startsWith("/media/") || /^https:\/\//.test(value);

const EXT_BY_TYPE: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/avif": "avif",
  "image/gif": "gif",
  "image/svg+xml": "svg",
  "application/pdf": "pdf",
};

/** "My Photo (1).JPG" → "my-photo-1.jpg": safe, readable file names. A missing extension comes from the type. */
export function slugFileName(name: string, type?: string): string {
  const dot = name.lastIndexOf(".");
  const ext = dot > 0 ? name.slice(dot + 1).toLowerCase().replace(/[^a-z0-9]/g, "") : "";
  const base = (dot > 0 ? name.slice(0, dot) : name)
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  const finalExt = ext || (type ? EXT_BY_TYPE[type] : "") || "";
  return `${base || "file"}${finalExt ? `.${finalExt}` : ""}`;
}

export function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(n < 10 * 1024 ? 1 : 0)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
}
