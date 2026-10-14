<script lang="ts">
  import { Select as SelectPrimitive } from "bits-ui";
  import { scale } from "svelte/transition";
  import SelectPortal from "./select-portal.svelte";
  import SelectScrollUpButton from "./select-scroll-up-button.svelte";
  import SelectScrollDownButton from "./select-scroll-down-button.svelte";
  import { popupScale } from "$lib/components/transitions/popup";
  import { cn, type WithoutChild } from "$lib/component-attributes";
  import type { ComponentProps } from "svelte";
  import type { WithoutChildrenOrChild } from "$lib/component-attributes";

  let {
    ref = $bindable(null),
    class: className,
    sideOffset = 4,
    portalProps,
    children,
    preventScroll = true,
    ...restProps
  }: WithoutChild<SelectPrimitive.ContentProps> & {
    portalProps?: WithoutChildrenOrChild<ComponentProps<typeof SelectPortal>>;
  } = $props();
</script>

<SelectPortal {...portalProps}>
  <SelectPrimitive.Content
    preventOverflowTextSelection={false}
    bind:ref
    {sideOffset}
    {preventScroll}
    forceMount
    data-slot="select-content"
    class={cn(
      "bg-popover text-popover-foreground ring-foreground/5 dark:ring-foreground/10",
      "min-w-36 origin-top rounded-3xl shadow-lg ring-1 relative",
      "isolate z-50 overflow-x-hidden overflow-y-auto",
      className,
    )}
    {...restProps}
  >
    {#snippet child({ props, wrapperProps, open })}
      <div {...wrapperProps}>
        {#if open}
          <div {...props} transition:scale={popupScale}>
            <SelectScrollUpButton />
            <SelectPrimitive.Viewport
              class={cn(
                "h-(--bits-select-anchor-height) w-full min-w-(--bits-select-anchor-width) scroll-my-1",
              )}
            >
              {@render children?.()}
            </SelectPrimitive.Viewport>
            <SelectScrollDownButton />
          </div>
        {/if}
      </div>
    {/snippet}
  </SelectPrimitive.Content>
</SelectPortal>
