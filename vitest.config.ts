import fs from "node:fs";
import path from "node:path";
import { defineConfig } from "vitest/config";

/** Local env (DATABASE_URL etc.) so the database-backed tests can run; they skip when it is missing. */
function localEnv(): Record<string, string> {
  const out: Record<string, string> = {};
  for (const file of [".env", ".env.local"]) {
    if (!fs.existsSync(file)) continue;
    for (const line of fs.readFileSync(file, "utf8").split("\n")) {
      const m = /^([A-Z_][A-Z0-9_]*)=(.*)$/.exec(line);
      if (m) out[m[1]] = m[2].replace(/^["']|["']$/g, "");
    }
  }
  return out;
}

export default defineConfig({
  resolve: { alias: { "~": path.resolve(__dirname, "src") } },
  test: { environment: "node", include: ["tests/unit/**/*.test.ts"], env: localEnv() },
});
