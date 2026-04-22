import { defineConfig } from "@playwright/test";
import { fileURLToPath } from "node:url";
import path from "path";

const currentFile = fileURLToPath(import.meta.url);
const currentDir = path.dirname(currentFile);
const rootDir = path.resolve(currentDir, "..");

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  timeout: 30_000,
  use: {
    baseURL: process.env.BASE_URL || "http://localhost:4000",
  },
  webServer: {
    command: "npm run build --workspace backend && node backend/dist/main.js",
    cwd: rootDir,
    url: "http://localhost:4000/api/v1/health",
    timeout: 120_000,
    reuseExistingServer: true,
    env: {
      PORT: "4000",
      NODE_OPTIONS: "",
      DATABASE_URL:
        process.env.DATABASE_URL ||
        "postgresql://mac@localhost:5432/unimarket_backend",
    },
  },
});
