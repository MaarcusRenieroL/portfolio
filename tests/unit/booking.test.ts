import { describe, expect, it } from "vitest";
import { generateIcs } from "~/lib/server/ics";
import { isBookableSlot, istToUtc, upcomingSlots } from "~/lib/booking";

describe("ics + booking", () => {
  it("escapes and folds", () => {
    const ics = generateIcs({ id: "x", method: "REQUEST", title: "A, B; C\\D", description: "line1\nline2", start: new Date("2026-11-20T09:30:00Z"), durationMinutes: 30, attendeeEmail: "a@b.co", attendeeName: 'Bad"Name' + "x".repeat(80) });
    expect(ics).toContain(String.raw`SUMMARY:A\, B\; C\\D`);
    expect(ics).toContain(String.raw`DESCRIPTION:line1\nline2`);
    expect(ics).toContain("DTSTART:20261120T093000Z");
    expect(ics).toContain("DTEND:20261120T100000Z");
    for (const line of ics.split("\r\n")) expect(new TextEncoder().encode(line).length).toBeLessThanOrEqual(75);
    expect(ics).not.toContain('Bad"Name');
  });
  it("IST slots map to the right UTC instants", () => {
    expect(istToUtc("2026-11-20", "15:00").toISOString()).toBe("2026-11-20T09:30:00.000Z");
    const now = Date.parse("2026-11-16T12:00:00Z");
    const slots = upcomingSlots(now);
    expect(slots[0].getTime() - now).toBeGreaterThanOrEqual(12 * 3600_000);
    expect(isBookableSlot(new Date("2026-11-20T09:30:00Z"), now)).toBe(true);
    expect(isBookableSlot(new Date("2026-11-20T09:31:00Z"), now)).toBe(false);
  });
});
