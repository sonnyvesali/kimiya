<script lang="ts">
  import Notice from "$lib/components/feedback/Notice.svelte";
  import Icon from "$lib/components/icons/Icon.svelte";
  import InviteExpirySettings from "./InviteExpirySettings.svelte";
  import { createInviteExpiryWorkflow } from "../workflows/invite-expiry-workflow.svelte";
  import InviteCredentials from "./InviteCredentials.svelte";
  import { untrack } from "svelte";
  let {
    invite,
    result,
  }: {
    invite: { id: string; expiresAt: Date | string | null } | null;
    result: {
      message?: string;
      tone?: "error" | "success";
      credentials?: { url: string; code: string } | null;
    } | null;
  } = $props();
  const workflow = createInviteExpiryWorkflow(() => invite);
  $effect(() => {
    const current = invite;
    untrack(() => workflow.resetForInvite(current));
  });
</script>

<section class="surface mt-8 p-6" aria-labelledby="invite-title">
  <h2 id="invite-title" class="font-medium">Invite your students</h2>
  <p class="mt-2 text-sm leading-6 text-muted-foreground">
    One reusable invitation, three ways to join: QR code, link, or class code.
  </p>
  {#if invite}<p class="mt-4 text-sm">
      {invite.expiresAt
        ? `Expires ${new Date(invite.expiresAt).toLocaleString()}`
        : "Active invitation · no expiration"}
    </p>{:else}<p class="mt-4 text-sm text-muted-foreground">
      No active invitation.
    </p>{/if}
  <form method="POST" action="?/invite" class="mt-5 space-y-4">
    <input type="hidden" name="expiresAt" value={workflow.serialized} />
    <div class="flex flex-wrap gap-3">
      <button
        name="operation"
        value="generate"
        class="button"
        disabled={!workflow.valid}
        ><Icon name="qr-code" />{invite
          ? "Regenerate invitation"
          : "Generate invitation"}</button
      >{#if invite}<button
          name="operation"
          value="revoke"
          class="button-secondary text-destructive">Revoke</button
        >{/if}
    </div>
    <InviteExpirySettings {workflow} hasInvite={!!invite} />
  </form>
  {#if invite}<p class="mt-4 text-xs leading-5 text-muted-foreground">
      Regenerating or revoking disables the previous QR code, link, and class
      code. Saved invitation details are only shown when generated.
    </p>{/if}
  {#if result?.message}<Notice
      tone={result.tone || "success"}
      message={result.message}
      class="mt-5"
    />{/if}
  {#if result?.credentials}<InviteCredentials
      credentials={result.credentials}
    />{/if}
</section>
