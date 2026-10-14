<script lang="ts">
  import AccountRoleCard from "$lib/features/onboarding/components/AccountRoleCard.svelte";
  import Notice from "$lib/components/feedback/Notice.svelte";
  import type { PageProps } from "./$types";
  let { form }: PageProps = $props();
</script>

<svelte:head><title>Your role · Kimiya</title></svelte:head>
<main
  class="mx-auto flex min-h-screen max-w-xl flex-col justify-center px-6 py-16"
>
  <p class="eyebrow">Welcome to Kimiya</p>
  <h1 class="mt-3 text-3xl font-semibold tracking-tight">
    How will you use your space?
  </h1>
  <p class="mt-4 text-sm leading-6 text-muted-foreground">
    Choose your account role to get started. This choice stays with your
    account.
  </p>
  <form method="POST" class="mt-8 space-y-4">
    <AccountRoleCard
      role="educator"
      title="I’m an educator"
      description="Create classes, invite students, and bring your classroom together."
    />
    <AccountRoleCard
      role="student"
      title="I’m a student"
      description="Join your classes and make room for what’s next."
    />
    {#if form?.message}<Notice
        tone="error"
        message={form.message}
      />{/if}<button class="button mt-4 w-full">Continue</button>
  </form>
</main>
