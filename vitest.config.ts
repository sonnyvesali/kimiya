import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";
const path = (value: string) => fileURLToPath(new URL(value, import.meta.url));
export default defineConfig({
  resolve: {
    alias: {
      $lib: path("./src/lib"),
      "$env/dynamic/private": path("./tests/config/private-env.ts"),
      "$env/dynamic/public": path("./tests/config/public-env.ts"),
      "$app/environment": path("./tests/config/app-environment.ts"),
    },
  },
  test: { include: ["tests/**/*.test.ts"], fileParallelism: false },
});
