import { defineConfig } from "@playwright/test";

const PORT = 3177;

export default defineConfig({
  testDir: "tests/e2e",
  use: { baseURL: `http://localhost:${PORT}` },
  webServer: {
    command: `pnpm dev --port ${PORT}`,
    env: { NEXT_DIST_DIR: ".next-e2e" },
    url: `http://localhost:${PORT}`,
    reuseExistingServer: false,
    timeout: 120_000,
  },
});
