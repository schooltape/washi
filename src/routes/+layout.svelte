<script lang="ts">
  import { goto, onNavigate } from "$app/navigation";
  import { ChevronsUpDown, Cloud, CloudAlert, CloudCheck, CloudOff } from "@lucide/svelte";
  import "../app.css";
  import { credentials, settings } from "$lib/store";
  import { DropdownMenu } from "bits-ui";
  import { slide } from "svelte/transition";
  import { page } from "$app/state";
  import { flavors } from "@catppuccin/palette";
  import { asset } from "$app/paths";

  let { children } = $props();
  let dropdownOpen = $state(false);

  $inspect(page.url);

  onNavigate((navigation) => {
    if (!document.startViewTransition) return;

    return new Promise((resolve) => {
      document.startViewTransition(async () => {
        resolve();
        await navigation.complete;
      });
    });
  });
</script>

<svelte:head>
  <title>{page.data.title}</title>
</svelte:head>

<div
  class="bg-ctp-base text-ctp-text {settings.state.theme.flavour}"
  style="--ctp-accent: {flavors[settings.state.theme.flavour].colors[settings.state.theme.accent].hex}">
  <nav
    class="fixed top-0 grid h-7 w-full grid-cols-[1fr_auto_1fr] items-center bg-ctp-mantle text-sm text-ctp-subtext0">
    <div data-tauri-drag-region class="h-full">&nbsp</div>

    <DropdownMenu.Root bind:open={dropdownOpen}>
      <DropdownMenu.Trigger
        class="m-1 flex items-center justify-center gap-1 rounded-sm px-1 transition-colors duration-300 {!!credentials
          .state.auth
          ? 'hover:bg-ctp-surface0'
          : ''}">
        <img src={asset("/favicon.png")} alt="washi icon" class="size-4" />
        <span class="font-semibold">{page.data.title}</span>
        {#if !!credentials.state.auth}
          <ChevronsUpDown class="-mr-1 size-4" />
        {/if}
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content class="rounded-lg bg-ctp-crust p-2 {settings.state.theme.flavour}" forceMount>
          {#snippet child({ wrapperProps, props, open })}
            {#if open}
              <div {...wrapperProps}>
                <div {...props} transition:slide>
                  <DropdownMenu.Group class="flex flex-col gap-2">
                    {@render dropdownItem("/", "Home", ["⌘", "D"])}
                    {@render dropdownItem("/timetable", "Timetable", ["⌘", "T"])}
                    {@render dropdownItem("/debugging", "Debugging")}
                    {@render dropdownItem("/auth", "Auth")}
                  </DropdownMenu.Group>
                </div>
              </div>
            {/if}
          {/snippet}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>

    <div class="flex h-full items-center pr-1.5">
      <div data-tauri-drag-region class="h-full grow">&nbsp;</div>

      <div>
        {#if !!credentials.state.auth}
          {#if credentials.state.status.type === "synced"}
            <CloudCheck class="size-5" />
          {:else if credentials.state.status.type === "syncing"}
            <Cloud class="size-5 animate-pulse" />
          {:else if credentials.state.status.type === "offline"}
            <CloudOff class="size-5 stroke-ctp-red" />
          {:else}
            <CloudAlert class="size-5 stroke-ctp-red" />
          {/if}
        {/if}
      </div>
    </div>
  </nav>

  <div class="flex h-screen flex-col overflow-hidden">
    <hr class="h-7" />
    <div class="flex-1 overflow-auto">
      {@render children()}
    </div>
  </div>
</div>

{#snippet dropdownItem(href: string, name: string, kbd: string[] = [])}
  {#if href !== page.url.pathname}
    <DropdownMenu.Item
      class="flex items-center justify-between gap-4 rounded-md px-2 py-1 hover:bg-ctp-surface0"
      onSelect={() => {
        goto(href);
      }}>
      <span class="text-ctp-text">{name}</span>
      <div class="flex items-center gap-1">
        {#each kbd as key}
          <kbd
            class="inline-flex size-5 items-center justify-center rounded-md border border-ctp-surface1 bg-ctp-mantle text-xs text-ctp-overlay0 shadow-md"
            >{key}</kbd>
        {/each}
      </div>
    </DropdownMenu.Item>
  {/if}
{/snippet}
