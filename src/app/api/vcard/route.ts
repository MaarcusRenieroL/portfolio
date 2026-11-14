import { SITE } from "~/lib/content";

/** A contact card for "save to contacts". Lines end in CRLF and commas are escaped, as vCard 3.0 requires. */
const esc = (s: string) => s.replace(/\\/g, "\\\\").replace(/([,;])/g, "\\$1").replace(/\n/g, "\\n");

export function GET() {
  const card = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    "N:L;Maarcus Reniero;;;",
    `FN:${esc(SITE.name)}`,
    "TITLE:Full stack engineer",
    `EMAIL;TYPE=INTERNET:${SITE.email}`,
    `URL:${SITE.url}`,
    `URL;TYPE=GitHub:${SITE.github}`,
    `URL;TYPE=LinkedIn:${SITE.linkedin}`,
    `ADR;TYPE=WORK:;;;Chennai;;;India`,
    `NOTE:${esc(SITE.open)}`,
    "END:VCARD",
    "",
  ].join("\r\n");
  return new Response(card, {
    headers: { "Content-Type": "text/vcard; charset=utf-8", "Content-Disposition": 'attachment; filename="maarcus-reniero-l.vcf"', "Cache-Control": "public, max-age=86400" },
  });
}
