import { describe, expect, it } from "vitest";
import { computeSkillUsage, mentions } from "~/lib/skill-match";

describe("mentions", () => {
  it("finds whole technology names in running text", () => {
    const p = "Deliver client requirements on time, with unit and integration tests in all four modules (JUnit, Mockito, MockMvc, Testcontainers).";
    for (const s of ["JUnit", "Mockito", "MockMvc", "Testcontainers"]) expect(mentions(p, s)).toBe(true);
    expect(mentions("Built REST APIs in Strapi.", "REST APIs")).toBe(true);
    expect(mentions("Shipped on Next.js and Node.js.", "Next.js")).toBe(true);
    expect(mentions("Java services", "Java 21")).toBe(true);
  });
  it("never matches inside a longer name", () => {
    expect(mentions("PostgreSQL tuning", "SQL")).toBe(false);
    expect(mentions("JavaScript UI", "Java 21")).toBe(false);
    expect(mentions("Django app", "Go")).toBe(false);
    expect(mentions("Next.js app", "Next")).toBe(false);
    expect(mentions("C++ tools", "C")).toBe(false);
    expect(mentions("Angular 18", "Angular")).toBe(true);
  });
});

describe("computeSkillUsage evidence", () => {
  const data = {
    roles: [
      { org: "HealthEdge", title: "Developer", tags: ["Java", "AWS S3 · CloudWatch"], points: ["Tests in every module (JUnit, Mockito)."] },
      { org: "Matlync", title: "Dev", tags: ["Next.js"], points: [] },
    ],
    projects: [
      { name: "nyx", slug: "nyx", kind: "app", skills: ["Rust", "SQLite FTS5"] },
      { name: "site", slug: "site", kind: "web", skills: ["shadcn/ui"] },
    ],
  };
  it("splits combined tags and reads bullet points", () => {
    expect(computeSkillUsage("CloudWatch", data).roles.map((r) => r.org)).toEqual(["HealthEdge"]);
    expect(computeSkillUsage("AWS S3", data).roles.map((r) => r.org)).toEqual(["HealthEdge"]);
    expect(computeSkillUsage("Mockito", data).roles.map((r) => r.org)).toEqual(["HealthEdge"]);
    expect(computeSkillUsage("Java 21", data).roles.map((r) => r.org)).toEqual(["HealthEdge"]);
  });
  it("keeps projects to their declared skills and ignores unknown skills", () => {
    expect(computeSkillUsage("Rust", data).projects.map((p) => p.slug)).toEqual(["nyx"]);
    expect(computeSkillUsage("Kotlin", data)).toMatchObject({ roles: [], projects: [] });
    expect(computeSkillUsage("SQL", data).roles).toEqual([]);
    // A slash is part of a name, not a separator.
    expect(computeSkillUsage("shadcn/ui", data).projects.map((p) => p.slug)).toEqual(["site"]);
  });
});
