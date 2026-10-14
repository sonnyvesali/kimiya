<script lang="ts">
  import ClassList from "$lib/features/classes/components/ClassList.svelte";
  import ClassHomeActions from "$lib/features/classes/components/ClassHomeActions.svelte";
  import type { PageProps } from "./$types";
  let { data, form }: PageProps = $props();
</script>

<svelte:head><title>My classes · Kimiya</title></svelte:head>
<p class="eyebrow">Your classroom, connected</p>
<h1 class="mt-3 text-3xl font-semibold tracking-tight">My classes</h1>
<p class="mt-3 text-sm text-muted-foreground">
  {data.profile?.role === "educator"
    ? "Create a space. Bring your students together."
    : "All your learning spaces, in one place."}
</p>
{#if form?.message}<p role="alert" class="mt-4 text-sm text-destructive">
    {form.message}
  </p>{/if}
<ClassHomeActions role={data.profile!.role!} /><ClassList
  classes={data.classes}
/>
