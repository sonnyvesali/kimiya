<script lang="ts">
  import Icon from "$lib/components/icons/Icon.svelte";
  let { role }: { role: string } = $props();
</script>

<section class="surface mt-8 p-6">
  {#if role === "educator"}<h2 class="font-medium">Create a class</h2>
    <p class="mt-2 text-sm text-muted-foreground">
      A new space for your students.
    </p>
    <form
      method="POST"
      action="?/create"
      class="mt-5 flex flex-col gap-3 sm:flex-row"
    >
      <label class="flex-1"
        ><span class="sr-only">Class name</span><input
          name="name"
          placeholder="e.g. Introduction to chemistry"
          required
          maxlength="120"
        /></label
      ><button class="button"><Icon name="plus" />Create class</button>
    </form>
  {:else}<h2 class="font-medium">Join your classroom</h2>
    <p class="mt-2 text-sm text-muted-foreground">
      Scan your educator’s QR code, open their invite link, or enter a class
      code here.
    </p>
    <form
      method="POST"
      action="?/code"
      class="mt-5 flex flex-col gap-3 sm:flex-row"
    >
      <label class="flex-1"
        ><span class="sr-only">Class code</span><input
          name="code"
          placeholder="ABCD-EFGH-JKLM"
          required
          maxlength="30"
          autocomplete="off"
          spellcheck="false"
        /></label
      ><button class="button"><Icon name="arrow-right" />Find class</button>
    </form>{/if}
</section>
