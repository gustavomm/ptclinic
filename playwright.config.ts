import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  use: { baseURL: "http://localhost:3000", trace: "on-first-retry" },
  webServer: {
    command: "npm run build && npm run start",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
    // Never let a test run write to the leads Sheet, even if production
    // variables were pulled into a local .env file. Next does not override
    // variables already set in the process environment.
    env: { LEAD_WEBHOOK_URL: "", LEAD_WEBHOOK_SECRET: "" },
  },
});
