<script lang="ts">
  import JoinClass from "$lib/features/classes/components/JoinClass.svelte";
  import type { PageProps } from "./$types";
  let { data, form }: PageProps = $props();
</script>

<svelte:head
  ><title>Join a class · Kimiya</title><meta
    name="referrer"
    content="no-referrer"
  /></svelte:head
>
<JoinClass
  invitation={data.invitation}
  message={form?.message || data.message}
/>
