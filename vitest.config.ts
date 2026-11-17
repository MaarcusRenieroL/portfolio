import fs from "node:fs";
import path from "node:path";
import { defineConfig } from "vitest/config";

/**
 * Local env (DATABASE_URL etc.) so the database-backed tests can run; they skip when it is missing.
 * Storage credentials are never passed through: tests must not reach the real R2 buckets, so R2 is off unless a
 * test turns it on with stubbed values.
 */
const NEVER_IN_TESTS = /^(R2_|NEXT_PUBLIC_ASSETS_URL$)/;

function localEnv(): Record<string, string> {
  const out: Record<string, string> = {};
  for (const file of [".env", ".env.local"]) {
    if (!fs.existsSync(file)) continue;
    for (const line of fs.readFileSync(file, "utf8").split("\n")) {
      const m = /^([A-Z_][A-Z0-9_]*)=(.*)$/.exec(line);
      if (m && !NEVER_IN_TESTS.test(m[1])) out[m[1]] = m[2].replace(/^["']|["']$/g, "");
    }
  }
  return out;
}

export default defineConfig({
  resolve: { alias: { "~": path.resolve(__dirname, "src") } },
  test: { environment: "node", include: ["tests/unit/**/*.test.ts"], env: localEnv(),
    coverage: {
      provider: "v8",
      reporter: ["text", "json-summary"],
      include: ["src/lib/**/*.ts", "src/app/api/**/*.ts", "src/app/admin/*actions.ts", "src/app/media/**/*.ts", "src/app/.well-known/**/*.ts"],
    },
  },
});
