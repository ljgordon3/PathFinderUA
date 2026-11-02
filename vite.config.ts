import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { Agent } from "node:http";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target: "http://127.0.0.1:8000",
        // Reloads/cancelled preference requests must not reuse stale upstream sockets.
        agent: new Agent({ keepAlive: false }),
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
  test: {
    include: ["src/**/*.test.ts"],
    coverage: {
      provider: "v8",
      // UI workflows are verified by Playwright, not included in this unit metric.
      include: ["src/api.ts", "src/data.ts", "src/planning.ts"],
      reporter: ["text", "html", "json-summary"],
      reportsDirectory: "coverage/frontend",
      thresholds: { lines: 80, branches: 75, functions: 80, statements: 80 },
    },
  },
});
