import { SITE } from "~/lib/content";

/** RFC 9116 security contact. Expires is always a year out, so the file never goes stale. */
export function GET() {
  const expires = new Date(Date.now() + 365 * 86400_000);
  expires.setUTCHours(0, 0, 0, 0);
  const body = [
    `Contact: mailto:${SITE.email}`,
    `Expires: ${expires.toISOString()}`,
    "Preferred-Languages: en, de",
    `Canonical: ${SITE.url}/.well-known/security.txt`,
    `Policy: ${SITE.url}/legal#security`,
    "",
  ].join("\n");
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=86400" } });
}
