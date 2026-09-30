import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  use: {
    baseURL: "http://127.0.0.1:5173",
    viewport: { width: 1440, height: 1050 },
    channel: process.env.PLAYWRIGHT_CHANNEL,
  },
  webServer: [
    {
      command: process.env.PATHFINDER_PYTHON
        ? `\"${process.env.PATHFINDER_PYTHON}\" -m uvicorn app.main:app --host 127.0.0.1 --port 8000`
        : process.platform === "win32"
          ? ".venv\\Scripts\\python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8000"
          : ".venv/bin/python -m uvicorn app.main:app --host 127.0.0.1 --port 8000",
      cwd: "backend",
      url: "http://127.0.0.1:8000/health",
      reuseExistingServer: !process.env.CI,
    },
    {
      command: "npm run dev -- --port 5173 --strictPort",
      url: "http://127.0.0.1:5173",
      reuseExistingServer: !process.env.CI,
    },
  ],
});
