<script lang="ts">
  let { classes }: { classes: { id: string; name: string }[] } = $props();
</script>

<section class="mt-10" aria-labelledby="classes-title">
  <h2 id="classes-title" class="eyebrow mb-4">
    Your classes · {classes.length}
  </h2>
  {#if classes.length}<div class="surface divide-y">
      {#each classes as record}<a
          href={`/classes/${record.id}`}
          class="flex items-center justify-between gap-4 px-6 py-5 hover:bg-muted"
          ><span class="flex items-center gap-4"
            ><span
              class="flex size-10 items-center justify-center rounded-lg bg-accent font-medium text-primary"
              >{record.name.slice(0, 1).toUpperCase()}</span
            ><span class="font-medium">{record.name}</span></span
          ><span aria-hidden="true" class="text-muted-foreground">→</span></a
        >{/each}
    </div>
  {:else}<div class="surface px-6 py-14 text-center">
      <h3 class="font-medium">Room for your first class.</h3>
      <p class="mt-2 text-sm text-muted-foreground">
        Use the form above to get started.
      </p>
    </div>{/if}
</section>
