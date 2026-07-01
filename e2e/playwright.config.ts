import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  reporter: "html",
  use: {
    baseURL: "http://localhost:5173",
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  // TODO (con l'AI): abilita il webServer per avviare api+web automaticamente.
  // webServer: [
  //   { command: "npm run dev -w api", url: "http://localhost:3000/health", reuseExistingServer: true },
  //   { command: "npm run dev -w web", url: "http://localhost:5173", reuseExistingServer: true },
  // ],
});
