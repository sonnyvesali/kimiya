<script lang="ts">
  import Notice from "$lib/components/feedback/Notice.svelte";
  let {
    invitation,
    message,
  }: {
    invitation: {
      className: string;
      educatorName: string;
      classId: string;
      alreadyJoined: boolean;
      canJoin: boolean;
    } | null;
    message: string | null;
  } = $props();
</script>

<section class="mx-auto max-w-lg py-12">
  <p class="eyebrow">A place for you</p>
  <h1 class="mt-3 text-3xl font-semibold tracking-tight">
    {invitation?.className || "Class invitation"}
  </h1>
  {#if invitation}<p class="mt-3 text-sm text-muted-foreground">
      With {invitation.educatorName}
    </p>
    <div class="surface mt-8 p-6">
      {#if invitation.alreadyJoined}<p class="text-sm">
          You’re already part of this class.
        </p>
        <a class="button mt-5" href={`/classes/${invitation.classId}`}
          >Open class</a
        >
      {:else if invitation.canJoin}<p class="text-sm text-muted-foreground">
          Join this class to add it to your learning spaces.
        </p>
        <form method="POST">
          <button class="button mt-5">Join class</button>
        </form>
      {:else}<p class="text-sm text-muted-foreground">
          This invitation is for students. Educator accounts create and manage
          their own classes.
        </p>{/if}
    </div>{/if}
  {#if message}<Notice tone="error" {message} class="mt-6" />{/if}<a
    href="/"
    class="mt-6 inline-block text-sm text-primary">Back to my classes</a
  >
</section>
