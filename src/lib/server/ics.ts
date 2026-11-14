export function generateIcs({
  id,
  title,
  description,
  start,
  durationMinutes,
  attendeeEmail,
  attendeeName,
}: {
  id: string;
  title: string;
  description: string;
  start: Date;
  durationMinutes: number;
  attendeeEmail: string;
  attendeeName: string;
}): string {
  const end = new Date(start.getTime() + durationMinutes * 60 * 1000);

  const formatUtc = (d: Date) =>
    d
      .toISOString()
      .replace(/[-:]/g, "")
      .replace(/\.\d{3}/, "");

  const nowStr = formatUtc(new Date());
  const startStr = formatUtc(start);
  const endStr = formatUtc(end);

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Maarcus Reniero L//Mini Cal//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:REQUEST",
    "BEGIN:VEVENT",
    `UID:${id}@maarcus.dev`,
    `DTSTAMP:${nowStr}`,
    `DTSTART:${startStr}`,
    `DTEND:${endStr}`,
    `SUMMARY:${title}`,
    `DESCRIPTION:${description.replace(/\n/g, "\\n")}`,
    `ORGANIZER;CN=Maarcus Reniero L:mailto:maarcusreniero.l@gmail.com`,
    `ATTENDEE;CUTYPE=INDIVIDUAL;ROLE=REQ-PARTICIPANT;PARTSTAT=ACCEPTED;CN=${attendeeName}:mailto:${attendeeEmail}`,
    "STATUS:CONFIRMED",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}
