import { sveltekit } from "@sveltejs/kit/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [tailwindcss(), sveltekit()],
  server: { port: 5174, strictPort: true },
  resolve: { dedupe: ["@internationalized/date"] },
  ssr: { noExternal: ["svelte-sonner", "gridstack"] },
});
