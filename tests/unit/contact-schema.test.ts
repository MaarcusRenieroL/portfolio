import { describe, expect, it } from "vitest";
import { contactFormSchema, contactSchema } from "~/lib/contact-schema";

const valid = { name: "Ada Lovelace", email: "ada@example.com", org: "", reason: "role", message: "Hello there, this is long enough." };

describe("shared contact schema", () => {
  it("the browser schema accepts what the server schema accepts, and rejects the same things", () => {
    const cases: Record<string, unknown>[] = [
      valid,
      { ...valid, name: "A" },
      { ...valid, name: "line\nbreak" },
      { ...valid, email: "nope" },
      { ...valid, message: "short" },
      { ...valid, message: "x".repeat(5001) },
      { ...valid, org: "o".repeat(151) },
      { ...valid, reason: "bogus" },
    ];
    for (const c of cases) {
      const server = contactSchema.safeParse(c);
      const client = contactFormSchema.safeParse({ ...c, website: "" });
      expect(client.success, JSON.stringify(c)).toBe(server.success);
      if (!server.success && !client.success) expect(client.error.issues.map((i) => i.message)).toEqual(server.error.issues.map((i) => i.message));
    }
  });

  it("the honeypot is optional in the browser schema and ignored by the server schema", () => {
    expect(contactFormSchema.safeParse(valid).success).toBe(true);
    expect(contactSchema.safeParse({ ...valid, website: "x" }).success).toBe(true);
  });
});
