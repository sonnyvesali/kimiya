<script lang="ts">
  let { roster }: { roster: { id: string; fullName: string }[] } = $props();
</script>

<section class="mt-10">
  <h2 class="eyebrow mb-4">Students · {roster.length}</h2>
  <div class="surface divide-y">
    {#each roster as student}<div class="px-6 py-4 text-sm">
        {student.fullName}
      </div>{:else}<p class="px-6 py-10 text-sm text-muted-foreground">
        No students yet. Share an invitation to bring your class together.
      </p>{/each}
  </div>
</section>
