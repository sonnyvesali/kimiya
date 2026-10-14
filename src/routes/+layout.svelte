<script lang="ts">
  import "../app.css";
  import QueryProvider from "$lib/client/query/QueryProvider.svelte";
  import AppShell from "$lib/features/shell/components/AppShell.svelte";
  import { page } from "$app/state";
  import { onMount } from "svelte";
  import type { LayoutProps } from "./$types";
  let { data, children }: LayoutProps = $props();
  onMount(() => {
    const media = matchMedia("(prefers-color-scheme: dark)");
    const sync = () =>
      document.documentElement.classList.toggle("dark", media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  });
</script>

<QueryProvider>
  {#if data.profile?.role && page.url.pathname !== "/signin" && !page.url.pathname.startsWith("/auth/")}
    <AppShell profile={data.profile}>{@render children()}</AppShell>
  {:else}{@render children()}{/if}
</QueryProvider>
