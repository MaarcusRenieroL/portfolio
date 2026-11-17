import { SITE } from "~/lib/content";

/** RFC 5545 text escaping: backslash, semicolon, comma and newlines. Stops user input injecting properties. */
const esc = (s: string) => s.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");

/** Parameter values (CN=...) can't hold quotes or line breaks; quote them so commas and colons are safe. */
const param = (s: string) => `"${s.replace(/["\r\n]/g, "")}"`;

/** Fold lines longer than 75 octets, as the spec requires. */
function fold(line: string) {
  const out: string[] = [];
  let cur = "";
  for (const ch of line) {
    if (new TextEncoder().encode(cur + ch).length > 75) {
      out.push(cur);
      cur = " " + ch;
    } else cur += ch;
  }
  out.push(cur);
  return out.join("\r\n");
}

const stamp = (d: Date) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");

/**
 * A single-event calendar file. `REQUEST` is an invitation (sent by email);
 * `PUBLISH` is a plain event to save (the file a visitor downloads).
 */
export function generateIcs(e: {
  id: string;
  method: "REQUEST" | "PUBLISH";
  title: string;
  description: string;
  start: Date;
  durationMinutes: number;
  attendeeEmail: string;
  attendeeName: string;
}): string {
  const end = new Date(e.start.getTime() + e.durationMinutes * 60_000);
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Maarcus Reniero L//Portfolio booking//EN",
    "CALSCALE:GREGORIAN",
    `METHOD:${e.method}`,
    "BEGIN:VEVENT",
    `UID:${e.id}@maarcus.dev`,
    `DTSTAMP:${stamp(new Date())}`,
    `DTSTART:${stamp(e.start)}`,
    `DTEND:${stamp(end)}`,
    `SUMMARY:${esc(e.title)}`,
    `DESCRIPTION:${esc(e.description)}`,
    `ORGANIZER;CN=${param("Maarcus Reniero L")}:mailto:${SITE.email}`,
    `ATTENDEE;CUTYPE=INDIVIDUAL;ROLE=REQ-PARTICIPANT;PARTSTAT=NEEDS-ACTION;RSVP=TRUE;CN=${param(e.attendeeName)}:mailto:${e.attendeeEmail}`,
    "STATUS:CONFIRMED",
    "END:VEVENT",
    "END:VCALENDAR",
  ]
    .map(fold)
    .join("\r\n");
}
