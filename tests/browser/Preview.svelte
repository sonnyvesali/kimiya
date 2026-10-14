<script lang="ts">
  import "../../src/app.css";
  import AppShell from "$lib/features/shell/components/AppShell.svelte";
  import ClassList from "$lib/features/classes/components/ClassList.svelte";
  import ClassHomeActions from "$lib/features/classes/components/ClassHomeActions.svelte";
  import ClassRoster from "$lib/features/classes/components/ClassRoster.svelte";
  import JoinClass from "$lib/features/classes/components/JoinClass.svelte";
  import InviteControls from "$lib/features/invitations/components/InviteControls.svelte";
  import Signin from "../../src/routes/signin/+page.svelte";
  import Onboarding from "../../src/routes/onboarding/+page.svelte";
  import { onMount } from "svelte";
  import { qrSvg } from "$lib/features/invitations/form/qr-code";
  let screen = $state("classes"),
    role = $state("educator"),
    theme = $state("system");
  let decode = $state("Checking QR decoder…");
  const url = "https://kimiya.example/join/" + "a".repeat(48);
  const classes = [
    { id: "one", name: "Introduction to chemistry" },
    { id: "two", name: "Organic chemistry · Year 2" },
    { id: "three", name: "Science club" },
  ];
  $effect(() => {
    document.documentElement.style.colorScheme =
      theme === "system" ? "" : theme;
    document.documentElement.classList.toggle("dark", theme === "dark");
  });
  onMount(async () => {
    const Detector = (globalThis as any).BarcodeDetector;
    if (!Detector) {
      decode = "Native QR decoder unavailable in this browser.";
      return;
    }
    try {
      const image = new Image();
      image.src =
        "data:image/svg+xml;charset=utf-8," + encodeURIComponent(qrSvg(url));
      await image.decode();
      const results = await new Detector({ formats: ["qr_code"] }).detect(
        image,
      );
      decode =
        results[0]?.rawValue === url
          ? "QR decoded successfully"
          : "QR decode failed";
    } catch (err) {
      decode = String(err);
    }
  });
</script>

<div class="border-b bg-card p-3 text-xs">
  <span
    >Visual test fixture ·
  </span>{#each ["classes", "detail", "join", "signin", "onboarding"] as name}<button
      class="mx-2 underline"
      onclick={() => (screen = name)}>{name}</button
    >{/each}<button
    class="mx-2 underline"
    onclick={() => (role = role === "educator" ? "student" : "educator")}
    >Role: {role}</button
  ><button
    class="mx-2 underline"
    onclick={() => (theme = theme === "dark" ? "light" : "dark")}
    >Theme: {theme}</button
  ><span>{decode}</span>
</div>
{#if screen === "signin"}<Signin
    data={{
      next: "/",
      configured: true,
      mode: "signin",
      authError: false,
      profile: null,
    }}
    form={null}
    params={{}}
  />
{:else if screen === "onboarding"}<Onboarding
    data={{ next: "/", profile: null }}
    form={null}
    params={{}}
  />
{:else}<AppShell profile={{ fullName: "Ada Lovelace", role }}>
    {#if screen === "classes"}<p class="eyebrow">Your classroom, connected</p>
      <h1 class="mt-3 text-3xl font-semibold tracking-tight">My classes</h1>
      <p class="mt-3 text-sm text-muted-foreground">
        Create a space. Bring your students together.
      </p>
      <ClassHomeActions {role} /><ClassList {classes} />
    {:else if screen === "detail"}<p class="eyebrow">Your classroom</p>
      <h1 class="mt-3 text-3xl font-semibold tracking-tight">
        Introduction to chemistry
      </h1>
      <InviteControls
        invite={{ id: "one", expiresAt: null }}
        result={{
          message:
            "Invitation created. Save these details now; they are shown only once.",
          credentials: { url, code: "ABCD-EFGH-JKLM" },
        }}
      /><ClassRoster
        roster={[
          { id: "1", fullName: "Marie Curie" },
          { id: "2", fullName: "Linus Pauling" },
        ]}
      />
    {:else}<JoinClass
        invitation={{
          className: "Introduction to chemistry",
          educatorName: "Ada Lovelace",
          classId: "one",
          alreadyJoined: false,
          canJoin: role === "student",
        }}
        message={null}
      />{/if}
  </AppShell>{/if}
