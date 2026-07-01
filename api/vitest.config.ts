import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    include: ["src/**/*.{test,spec}.ts"],
    passWithNoTests: true,
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      include: ["src/**/*.ts"],
      exclude: ["src/**/*.test.ts", "src/server.ts"],
      // Soglia indicativa: scommenta per rendere il gate vincolante in CI
      // thresholds: { lines: 80, functions: 80, branches: 80, statements: 80 }
    },
  },
});
