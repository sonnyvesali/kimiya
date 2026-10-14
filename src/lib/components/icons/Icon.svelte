<script lang="ts">
  import { cn } from "$lib/component-attributes";
  import { phosphorPaths } from "./constants/phosphor-paths";
  let {
    name,
    class: className,
  }: { name: keyof typeof phosphorPaths; class?: string } = $props();
</script>

<svg
  viewBox="0 0 256 256"
  fill="currentColor"
  aria-hidden="true"
  focusable="false"
  class={cn("size-4 shrink-0", className)}
>
  {@html phosphorPaths[name]}
</svg>
