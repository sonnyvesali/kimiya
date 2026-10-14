<script lang="ts">
  import Icon from "$lib/components/icons/Icon.svelte";
  import { createInviteDisplayWorkflow } from "../workflows/invite-display-workflow.svelte";
  let { credentials }: { credentials: { url: string; code: string } } =
    $props();
  const workflow = createInviteDisplayWorkflow();
  const qr = $derived(workflow.qr(credentials.url));
</script>

<div class="mt-6 grid gap-6 border-t pt-6 sm:grid-cols-[180px_1fr]">
  <div>
    {#if qr.source}<img
        src={qr.source}
        alt="QR code to join this class"
        class="size-44 rounded-lg"
      /><a
        href={qr.source}
        download="kimiya-class-invite.svg"
        class="mt-3 inline-flex items-center gap-2 text-sm text-primary"
        ><Icon name="download-simple" />Download QR code</a
      >{:else}<p class="text-sm text-muted-foreground">{qr.error}</p>{/if}
  </div>
  <div class="space-y-5">
    <label class="block text-sm font-medium"
      >Invite link<input readonly value={credentials.url} class="mt-2" /></label
    ><button
      type="button"
      class="button-secondary"
      onclick={() => workflow.copy(credentials.url)}
      ><Icon name="copy" />Copy link</button
    ><label class="block text-sm font-medium"
      >Class code<input
        readonly
        value={credentials.code}
        class="mt-2 font-mono"
      /></label
    ><button
      type="button"
      class="button-secondary"
      onclick={() => workflow.copy(credentials.code)}
      ><Icon name="copy" />Copy code</button
    >
    <p role="status" class="text-sm text-primary">{workflow.message}</p>
  </div>
</div>
