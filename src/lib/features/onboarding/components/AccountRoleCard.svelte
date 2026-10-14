<script lang="ts">
  import Icon from "$lib/components/icons/Icon.svelte";
  import { cn } from "$lib/component-attributes";
  let {
    role,
    title,
    description,
  }: { role: "educator" | "student"; title: string; description: string } =
    $props();
</script>

<label
  class={cn(
    "surface flex cursor-pointer items-start gap-4 p-5 sm:p-6",
    "transition-[border-color,background-color,box-shadow] duration-150 motion-reduce:transition-none",
    "hover:border-primary/40 hover:bg-muted/50",
    "has-[:checked]:border-primary has-[:checked]:bg-primary/8 has-[:checked]:ring-1 has-[:checked]:ring-primary/30",
    "has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-4 has-[:focus-visible]:outline-primary",
  )}
>
  <input type="radio" name="role" value={role} required class="peer sr-only" />
  <span
    class={cn(
      "flex size-12 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground",
      "transition-colors peer-checked:bg-primary/15 peer-checked:text-primary",
    )}
  >
    <Icon
      name={role === "educator" ? "chalkboard-teacher" : "student"}
      class="size-7"
    />
  </span>
  <span class="min-w-0 flex-1">
    <span class="block font-semibold">{title}</span>
    <span class="mt-1.5 block text-sm leading-6 text-muted-foreground"
      >{description}</span
    >
  </span>
  <span
    class="mt-0.5 shrink-0 text-primary opacity-0 transition-opacity peer-checked:opacity-100"
  >
    <Icon name="check-circle" class="size-5" />
  </span>
</label>
