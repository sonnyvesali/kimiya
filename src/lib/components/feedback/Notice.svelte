<script lang="ts">
  import Icon from "$lib/components/icons/Icon.svelte";
  import { cn } from "$lib/component-attributes";
  let {
    tone = "info",
    message,
    title,
    class: className,
  }: {
    tone?: "error" | "success" | "info";
    message: string;
    title?: string;
    class?: string;
  } = $props();
  const icon = $derived(
    tone === "error"
      ? "warning-circle"
      : tone === "success"
        ? "check-circle"
        : "info",
  );
</script>

<div
  role={tone === "error" ? "alert" : "status"}
  class={cn(
    "flex items-start gap-3 rounded-lg border px-4 py-3.5 text-sm leading-6",
    tone === "error"
      ? "border-destructive/40 bg-destructive/10 text-destructive"
      : "border-border bg-muted text-foreground",
    className,
  )}
>
  <Icon name={icon} class="mt-0.5 size-5" />
  <div>
    {#if title}<p class="font-semibold">{title}</p>{/if}
    <p>{message}</p>
  </div>
</div>
