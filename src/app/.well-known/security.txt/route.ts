import { SITE } from "~/lib/content";

/** RFC 9116 contact for people who find a security issue. */
export function GET() {
  const expires = new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString();
  const body = [`Contact: mailto:${SITE.email}`, `Expires: ${expires}`, "Preferred-Languages: en", `Canonical: ${SITE.url}/.well-known/security.txt`, ""].join("\n");
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=86400" } });
}
