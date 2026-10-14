import adapter from "svelte-adapter-bun";

const config = {
  compilerOptions: {
    runes: ({ filename }) =>
      filename.split(/[/\\]/).includes("node_modules") ? undefined : true,
  },
  kit: {
    adapter: adapter(),

    alias: {
      $routes: "src/routes",
    },

    experimental: {
      tracing: {
        server: true,
      },

      instrumentation: {
        server: true,
      },
    },
  },
};

export default config;
