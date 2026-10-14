<script lang="ts">
  import type { Snippet } from "svelte";
  let {
    profile,
    children,
  }: { profile: { fullName: string; role?: string }; children: Snippet } =
    $props();
</script>

<div class="min-h-screen md:grid md:grid-cols-[232px_1fr]">
  <aside
    class="flex flex-col border-b bg-sidebar md:min-h-screen md:border-r md:border-b-0"
  >
    <a href="/" class="flex items-center gap-3 px-6 py-7"
      ><span
        class="flex size-8 items-center justify-center rounded-lg bg-primary text-lg text-primary-foreground"
        >k</span
      ><span class="text-lg font-semibold tracking-tight">kimiya</span></a
    >
    <nav aria-label="Main navigation" class="px-3 pb-4">
      <a
        href="/"
        class="flex items-center gap-3 rounded-lg bg-accent px-3 py-2.5 text-sm font-medium"
        ><span aria-hidden="true">▦</span> My classes</a
      >
    </nav>
    <div class="mt-auto hidden border-t px-6 py-5 md:block">
      <p class="truncate text-sm font-medium">{profile.fullName}</p>
      <p class="mt-1 text-xs capitalize text-muted-foreground">
        {profile.role}
      </p>
      <form method="POST" action="/auth/signout">
        <button class="mt-4 text-xs text-muted-foreground">Sign out</button>
      </form>
    </div>
  </aside>
  <div>
    <header
      class="flex h-16 items-center justify-between border-b px-6 md:px-10"
    >
      <span class="text-xs text-muted-foreground">A little space to learn.</span
      >
      <form method="POST" action="/auth/signout">
        <button class="text-xs text-muted-foreground">Sign out</button>
      </form>
    </header>
    <main class="mx-auto max-w-5xl px-6 py-10 md:px-10 md:py-14">
      {@render children()}
    </main>
  </div>
</div>
