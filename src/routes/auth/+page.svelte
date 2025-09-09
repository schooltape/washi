<script lang="ts">
  import { openUrl } from "@tauri-apps/plugin-opener";
  import {
    ArrowBigLeft,
    Braces,
    CircleCheck,
    CircleQuestionMark,
    CircleX,
    LoaderCircle,
    Lock,
    LockKeyhole,
  } from "@lucide/svelte";
  import { fade, slide } from "svelte/transition";
  import { asset } from "$app/paths";
  import Button from "$components/Button.svelte";
  import TextInput from "$components/TextInput.svelte";
  import { fetch } from "@tauri-apps/plugin-http";
  import { onOpenUrl } from "@tauri-apps/plugin-deep-link";
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import { credentials } from "$lib/store";

  let authMethod: "schooltape" | "manual" | undefined = $state();
  let authStage: "url" | "jwt" | "success" | "error" = $state("url");
  let schoolboxUrl = $state("");
  let schoolboxJwt = $state("");

  let jwtHelp = $state(false);
  let statusMessage = $state("");

  onMount(async () => {
    await onOpenUrl((urls) => {
      const url = new URL(urls[0]);

      const params = {
        jwt: url.searchParams.get("jwt"),
        url: url.searchParams.get("url"),
      };
      if (params.jwt && params.url) {
        schoolboxJwt = params.jwt;
        schoolboxUrl = params.url;
        submitJwt(schoolboxJwt, schoolboxUrl);
      } else {
        const e = "Malformed deep link";
        console.error(e);
        statusMessage = e;
        authStage = "error";
      }
    });
  });

  async function submitJwt(schoolboxJwt: string, schoolboxUrl: string) {
    if (!schoolboxUrl.startsWith("https://")) {
      schoolboxUrl = "https://" + schoolboxUrl;
    }

    // trim quotes from schoolboxJwt
    schoolboxJwt = schoolboxJwt.replace('"', "");

    // verify JWT is valid
    try {
      const response = await fetch(`${schoolboxUrl}/user/token`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${schoolboxJwt}`,
        },
      });

      // 200 if we are authorized, 308 if no authorization provided, 401 if invalid token
      if (response.status === 200) {
        const data = await response.json();
        console.log(data);
        credentials.state.auth = {
          jwt: schoolboxJwt,
          url: schoolboxUrl,
        };
        // credentials.state.status = { type: "synced" };
        statusMessage = `Authenticated as ${data.createdBy}`;
        authStage = "success";
        setTimeout(() => {
          goto("/");
        }, 300);
      } else {
        const e = `Failed to verify JWT, status code: ${response.status}`;
        console.error(e);
        statusMessage = e;
        authStage = "error";
      }
    } catch (e) {
      console.error(e);
      statusMessage = e as string;
      authStage = "error";
    }
  }
</script>

<div class="grid h-full place-items-center">
  <div class="card min-h-80 w-full max-w-xs">
    <div class="flex h-10 items-center justify-between">
      <h2>Login</h2>
      <!-- back button -->
      {#if authMethod !== undefined}
        <div transition:fade>
          <Button
            onclick={() => {
              schoolboxUrl = "";
              schoolboxJwt = "";
              jwtHelp = false;

              if (!(authMethod === "manual" && authStage === "jwt")) {
                authMethod = undefined;
              }
              authStage = "url";
            }}><ArrowBigLeft size={18} /> Back</Button>
        </div>
      {/if}
    </div>

    <div class="flex-grow">
      {#if authMethod === undefined}
        <div transition:slide class="flex flex-col gap-2">
          <Button
            onclick={() => {
              authMethod = "schooltape";
              openUrl("https://schooltape.github.io/washi-auth");
            }}><img src={asset("/schooltape.svg")} alt="Schooltape Logo" width="18" /> Sign in with Schooltape</Button>
          <Button
            onclick={() => {
              authMethod = "manual";
            }}><Braces class="text-ctp-flamingo" size={18} /> Enter JWT</Button>
        </div>
      {:else if authStage === "success" || authStage === "error"}
        {#if authStage === "success"}
          <div transition:slide>
            <h2 class="flex items-center gap-2 text-ctp-green"><CircleCheck /> Success!</h2>
            <p>{statusMessage}</p>
          </div>
        {:else if authStage === "error"}
          <div transition:slide>
            <h2 class="flex items-center gap-2 text-ctp-red"><CircleX /> Error :(</h2>
            <p>{statusMessage}</p>
          </div>
        {/if}
      {:else}
        <div transition:slide>
          {#if authMethod === "schooltape"}
            <div class="grid h-full place-items-center gap-4" transition:slide>
              <h3>Authenticating with Schooltape...</h3>
              <LoaderCircle size={48} class="animate-spin text-(--ctp-accent)" />
              <a
                class="subtext-sm flex items-center gap-2"
                href="https://schooltape.github.io"
                target="_blank"
                rel="noopener noreferrer">
                <CircleQuestionMark size={18} /> Don't have Schooltape?
              </a>
            </div>
          {:else if authMethod === "manual"}
            {#if authStage === "url"}
              <form
                onsubmit={() => {
                  if (!schoolboxUrl.startsWith("https://")) {
                    schoolboxUrl = "https://" + schoolboxUrl;
                  }
                  openUrl(`${schoolboxUrl}/user/token`);
                  authStage = "jwt";
                }}>
                <TextInput id="schoolbox-url" bind:value={schoolboxUrl} placeholder="Enter Schoolbox URL" />
              </form>
            {:else if authStage === "jwt"}
              <form
                onsubmit={() => {
                  submitJwt(schoolboxJwt, schoolboxUrl);
                }}>
                <TextInput id="jwt-input" placeholder="JWT" bind:value={schoolboxJwt}>
                  {#snippet icon(props)}
                    <LockKeyhole {...props} />
                  {/snippet}
                </TextInput>
              </form>

              <div class="subtext-sm">
                <button
                  class="mt-2 flex cursor-pointer items-center gap-2"
                  onclick={() => {
                    jwtHelp = !jwtHelp;
                  }}>
                  <CircleQuestionMark size={18} /> How do I find my JWT?
                </button>
                {#if jwtHelp}
                  <ol class="list-inside list-decimal" transition:slide>
                    <li>Login to your Schoolbox account.</li>
                    <li>Navigate to <code>/user/token</code></li>
                    <li>Copy the value of <code>token</code> from the JSON response.</li>
                    <li>Enter the JWT into the input box.</li>
                  </ol>
                {/if}
              </div>
            {/if}
          {/if}
        </div>
      {/if}
    </div>

    <p class="subtext-sm flex items-center gap-2"><Lock size={18} /> Privacy Policy</p>
  </div>
</div>
