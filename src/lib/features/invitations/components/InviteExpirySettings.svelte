<script lang="ts">
  import Icon from "$lib/components/icons/Icon.svelte";
  import Notice from "$lib/components/feedback/Notice.svelte";
  import { cn } from "$lib/component-attributes";
  import { expiryPresets } from "../constants/expiry-presets";
  import ExpiryDatePopover from "./ExpiryDatePopover.svelte";
  import type { InviteExpiryWorkflow } from "../workflows/invite-expiry-workflow.svelte";
  let {
    workflow,
    hasInvite,
  }: { workflow: InviteExpiryWorkflow; hasInvite: boolean } = $props();
</script>

<details
  open={workflow.advancedOpen}
  ontoggle={(event) => workflow.setAdvancedOpen(event.currentTarget.open)}
  class="group border-t pt-4"
>
  <summary
    class="flex cursor-pointer list-none items-center gap-2 text-sm text-muted-foreground [&::-webkit-details-marker]:hidden"
    ><Icon
      name="caret-right"
      class="transition-transform group-open:rotate-90"
    />Advanced options</summary
  >
  <div class="mt-5 space-y-4">
    <fieldset>
      <legend class="mb-3 text-sm font-medium">Expires</legend>
      <div class="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
        {#each expiryPresets as option}<label class="cursor-pointer"
            ><input
              type="radio"
              name="expiryPreset"
              value={option.value}
              checked={workflow.preset === option.value}
              onchange={() => workflow.selectPreset(option.value)}
              class="peer sr-only"
            /><span
              class={cn(
                "flex items-center justify-center rounded-md border px-3 py-2 text-sm",
                "bg-card text-muted-foreground hover:bg-muted",
                "peer-checked:border-primary peer-checked:bg-primary/10 peer-checked:text-primary",
                "peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-primary",
              )}>{option.label}</span
            ></label
          >{/each}
      </div>
    </fieldset>
    {#if workflow.preset === "custom"}<div class="space-y-3">
        <ExpiryDatePopover {workflow} /><button
          type="button"
          class="flex items-center gap-2 text-sm text-muted-foreground"
          aria-expanded={workflow.timeEnabled}
          onclick={workflow.toggleTime}
          ><Icon name="clock" />{workflow.timeEnabled
            ? "Use end of day instead"
            : "Set a time"}</button
        >{#if workflow.timeEnabled}<label class="block max-w-48 text-sm"
            >Time<input
              type="time"
              value={workflow.time}
              oninput={(event) => workflow.setTime(event.currentTarget.value)}
              class="mt-2"
            /><span class="mt-1 block text-xs text-muted-foreground"
              >Your local time</span
            ></label
          >{/if}
      </div>{/if}
    {#if workflow.error}<Notice
        tone="error"
        message={workflow.error}
      />{:else}<p class="text-sm leading-6 text-muted-foreground">
        {workflow.summary}
      </p>{/if}
    {#if hasInvite && workflow.dirty && workflow.valid}<button
        name="operation"
        value="expiry"
        class="button-secondary">Save changes</button
      >{/if}
  </div>
</details>
