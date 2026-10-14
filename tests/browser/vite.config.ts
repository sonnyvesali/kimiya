import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath } from "node:url";
export default defineConfig({
  build: { outDir: "/private/tmp/kimiya-ui-build", emptyOutDir: true },
  root: fileURLToPath(new URL(".", import.meta.url)),
  plugins: [tailwindcss(), svelte()],
  resolve: {
    alias: { $lib: fileURLToPath(new URL("../../src/lib", import.meta.url)) },
  },
  server: {
    host: "127.0.0.1",
    port: 8765,
    strictPort: true,
    fs: { allow: [fileURLToPath(new URL("../..", import.meta.url))] },
  },
});
