<script lang="ts">
  import Notice from "$lib/components/feedback/Notice.svelte";
  import { onMount } from "svelte";
  import { createSupabaseBrowserClient } from "$lib/supabase/client";
  import type { PageProps } from "./$types";
  let { data }: PageProps = $props();
  let failed = $state(false);
  let message = $state("Verifying your secure sign-in link…");
  onMount(async () => {
    const params = new URLSearchParams(location.hash.slice(1));
    const access_token = params.get("access_token"),
      refresh_token = params.get("refresh_token");
    history.replaceState(null, "", location.pathname + location.search);
    if (!access_token || !refresh_token) {
      failed = true;
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
      failed = true;
      message = "We couldn’t verify this link. Please request a new one.";
    }
  });
</script>

<svelte:head><title>Confirm sign-in · Kimiya</title></svelte:head>
<main class="mx-auto max-w-md px-6 py-32">
  <p class="eyebrow">Kimiya</p>
  <h1 class="mt-4 text-2xl font-semibold">Signing you in</h1>
  <Notice tone={failed ? "error" : "info"} {message} class="mt-4" />
  <a
    class="mt-6 inline-block text-sm text-primary"
    href={`/signin?next=${encodeURIComponent(data.next)}`}>Back to sign in</a
  >
</main>
