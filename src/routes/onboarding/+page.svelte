<script lang="ts">
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
    <label
      class="surface flex cursor-pointer gap-4 p-6 has-[:checked]:border-primary has-[:checked]:bg-accent"
      ><input type="radio" name="role" value="educator" required /><span
        ><span class="block font-medium">I’m an educator</span><span
          class="mt-2 block text-sm text-muted-foreground"
          >Create classes, invite students, and bring your classroom together.</span
        ></span
      ></label
    >
    <label
      class="surface flex cursor-pointer gap-4 p-6 has-[:checked]:border-primary has-[:checked]:bg-accent"
      ><input type="radio" name="role" value="student" required /><span
        ><span class="block font-medium">I’m a student</span><span
          class="mt-2 block text-sm text-muted-foreground"
          >Join your classes and make room for what’s next.</span
        ></span
      ></label
    >
    {#if form?.message}<p role="alert" class="text-sm text-destructive">
        {form.message}
      </p>{/if}<button class="button mt-4 w-full">Continue</button>
  </form>
  <form method="POST" action="/auth/signout">
    <button class="mt-6 text-sm text-muted-foreground">Sign out</button>
  </form>
</main>
