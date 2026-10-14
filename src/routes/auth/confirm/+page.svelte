<script lang="ts">
  import { onMount } from "svelte";
  import { createSupabaseBrowserClient } from "$lib/supabase/client";
  import type { PageProps } from "./$types";
  let { data }: PageProps = $props();
  let message = $state("Verifying your secure sign-in link…");
  onMount(async () => {
    const params = new URLSearchParams(location.hash.slice(1));
    const access_token = params.get("access_token"),
      refresh_token = params.get("refresh_token");
    history.replaceState(null, "", location.pathname + location.search);
    if (!access_token || !refresh_token) {
      message =
        "This sign-in link is invalid or expired. Please request a new one.";
      return;
    }
    try {
      const { error } = await createSupabaseBrowserClient().auth.setSession({
        access_token,
        refresh_token,
      });
      if (error) throw error;
      location.replace(
        `/auth/confirm/finish?next=${encodeURIComponent(data.next)}`,
      );
    } catch {
      message = "We couldn’t verify this link. Please request a new one.";
    }
  });
</script>

<svelte:head><title>Confirm sign-in · Kimiya</title></svelte:head>
<main class="mx-auto max-w-md px-6 py-32">
  <p class="eyebrow">Kimiya</p>
  <h1 class="mt-4 text-2xl font-semibold">Signing you in</h1>
  <p role="status" class="mt-4 text-sm text-muted-foreground">{message}</p>
  <a
    class="mt-6 inline-block text-sm text-primary"
    href={`/signin?next=${encodeURIComponent(data.next)}`}>Back to sign in</a
  >
</main>
