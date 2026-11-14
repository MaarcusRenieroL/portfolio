import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { defineConfig } from "@playwright/test";

const PORT = 3177;

function localEnv(): Record<string, string> {
  const out: Record<string, string> = {};
  for (const file of [".env", ".env.local"]) {
    if (!fs.existsSync(file)) continue;
    for (const line of fs.readFileSync(file, "utf8").split("\n")) {
      const m = /^([A-Z_][A-Z0-9_]*)=(.*)$/.exec(line);
      if (m) out[m[1]] = m[2];
    }
  }
  return out;
}

/** The admin tests get their own database so they can wipe it; without a local database they skip. */
const base = process.env.DATABASE_URL ?? localEnv().DATABASE_URL ?? "";
const testDb = base.endsWith("/portfolio") ? base.replace(/\/portfolio$/, "/portfolio_test") : "";
export const E2E_DB = testDb;
export const LINK_FILE = path.join(os.tmpdir(), "portfolio-e2e-magic-link.txt");

export default defineConfig({
  testDir: "tests/e2e",
  use: { baseURL: `http://localhost:${PORT}` },
  webServer: {
    command: `node scripts/e2e-reset.mjs && rm -rf .next-e2e && pnpm dev --port ${PORT}`,
    env: {
      NEXT_DIST_DIR: ".next-e2e",
      DATABASE_URL: testDb,
      ADMIN_SECRET: "e2e-secret-e2e-secret-e2e-secret-e2e-secret",
      MY_EMAIL: "owner@example.com",
      SETUP_TOKEN: "e2e-setup-token-0123456789",
      APP_URL: `http://localhost:${PORT}`,
      WEBAUTHN_ORIGIN: `http://localhost:${PORT}`,
      WEBAUTHN_RP_ID: "localhost",
      RESEND_API_KEY: "",
      RESEND_EMAIL: "",
      ADMIN_E2E_LINK_FILE: LINK_FILE,
    },
    url: `http://localhost:${PORT}`,
    reuseExistingServer: false,
    timeout: 120_000,
  },
});
