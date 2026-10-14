<script lang="ts">
  import Notice from "$lib/components/feedback/Notice.svelte";
  import type { PageProps } from "./$types";
  import { onMount } from "svelte";
  let { data, form }: PageProps = $props();
  onMount(() => {
    if (new URLSearchParams(location.hash.slice(1)).has("access_token"))
      location.replace(
        `/auth/confirm?next=${encodeURIComponent(data.next)}${location.hash}`,
      );
  });
</script>

<svelte:head
  ><title
    >{data.mode === "signup" ? "Create an account" : "Sign in"} · Kimiya</title
  ></svelte:head
>
<main class="flex min-h-screen items-center justify-center px-6 py-16">
  <div class="w-full max-w-sm">
    <a href="/" class="mb-12 flex items-center gap-3"
      ><span
        class="flex size-9 items-center justify-center rounded-md bg-foreground text-xl text-background"
        >k</span
      ><span class="text-xl font-semibold tracking-tight">kimiya</span></a
    >
    <p class="eyebrow">Your space to learn</p>
    <h1 class="mt-3 text-3xl font-semibold tracking-tight">
      {data.mode === "signup" ? "A fresh start." : "Welcome back."}
    </h1>
    <p class="mt-3 text-sm leading-6 text-muted-foreground">
      {data.mode === "signup"
        ? "Create your account, then find your classroom."
        : "Sign in with a secure email link. No password to remember."}
    </p>
    {#if !data.configured}<p
        role="status"
        class="mt-6 rounded-lg border bg-muted p-4 text-sm"
      >
        Sign-in will be available once Kimiya’s Supabase connection is
        configured.
      </p>{/if}
    {#if data.authError}<Notice
        tone="error"
        title="Sign-in link expired or invalid"
        message="That sign-in link couldn’t be verified. Request a new one below."
        class="mt-6"
      />{/if}
    {#if form?.message}<Notice
        tone={form.sent ? "success" : "error"}
        title={form.sent
          ? "Check your inbox"
          : "Couldn’t send your sign-in link"}
        message={form.message}
        class="mt-6"
      />
      {#if form.suggestSignup}<a
          class="button-secondary mt-3 w-full"
          href={`/signin?mode=signup&next=${encodeURIComponent(data.next)}`}
          >Create an account</a
        >{/if}
      {#if form.sent && data.localInbox}<a
          href="http://127.0.0.1:54324"
          target="_blank"
          rel="noreferrer"
          class="mt-3 inline-block text-sm text-primary"
          >Open local email inbox ↗</a
        >{/if}
    {/if}
    <form method="POST" class="mt-8 space-y-5">
      <input type="hidden" name="mode" value={data.mode} />
      {#if data.mode === "signup"}<label class="block text-sm font-medium"
          >Full name<input
            class="mt-2"
            name="fullName"
            value={form?.fullName || ""}
            autocomplete="name"
            maxlength="120"
            required
          /></label
        >{/if}
      <label class="block text-sm font-medium"
        >Email address<input
          class="mt-2"
          name="email"
          value={form?.email || ""}
          type="email"
          autocomplete="email"
          placeholder="you@example.com"
          required
          maxlength="254"
        /></label
      >
      <button class="button w-full" disabled={!data.configured}
        >{form?.sent ? "Send another link" : "Continue with email"}</button
      >
    </form>
    <p class="mt-7 text-center text-sm text-muted-foreground">
      {data.mode === "signup" ? "Already have an account?" : "New to Kimiya?"}
      <a
        class="font-medium text-primary"
        href={`/signin?mode=${data.mode === "signup" ? "signin" : "signup"}&next=${encodeURIComponent(data.next)}`}
        >{data.mode === "signup" ? "Sign in" : "Create an account"}</a
      >
    </p>
  </div>
</main>
