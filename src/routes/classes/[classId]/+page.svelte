<script lang="ts">
  import InviteControls from "$lib/features/invitations/components/InviteControls.svelte";
  import ClassRoster from "$lib/features/classes/components/ClassRoster.svelte";
  import type { PageProps } from "./$types";
  let { data, form }: PageProps = $props();
</script>

<svelte:head
  ><title>{data.record.name} · Kimiya</title><meta
    name="referrer"
    content="no-referrer"
  /></svelte:head
>
<a href="/" class="text-sm text-muted-foreground">← My classes</a>
<p class="eyebrow mt-8">
  {data.owned ? "Your classroom" : "Your learning space"}
</p>
<h1 class="mt-3 text-3xl font-semibold tracking-tight">{data.record.name}</h1>
{#if data.owned}{#key data.record.id}<InviteControls
      invite={data.invite}
      result={form}
    />{/key}<ClassRoster roster={data.roster} />{:else}<div
    class="surface mt-8 p-8"
  >
    <h2 class="font-medium">You’re part of this class.</h2>
    <p class="mt-3 text-sm text-muted-foreground">
      Your classroom is ready. More learning tools are on their way.
    </p>
  </div>{/if}
