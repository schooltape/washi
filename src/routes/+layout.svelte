<script>
  import { goto, onNavigate } from "$app/navigation";
  import { ChevronsUpDown, Cloud, CloudAlert, CloudCheck, CloudOff } from "@lucide/svelte";
  import "../app.css";
  import { credentials } from "$lib/store";
  import { DropdownMenu } from "bits-ui";

  let { children } = $props();
  let dropdownOpen = $state(false);
  let label = document.head.title || "Washi";

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

<nav class="fixed top-0 grid h-7 w-full grid-cols-[1fr_auto_1fr] items-center bg-ctp-mantle text-sm text-ctp-subtext0">
  <div data-tauri-drag-region class="h-full">&nbsp</div>

  <DropdownMenu.Root bind:open={dropdownOpen}>
    <DropdownMenu.Trigger
      class="m-1 flex items-center justify-center gap-1 rounded-sm px-1 transition-colors duration-300 {!!credentials
        .state.auth
        ? 'hover:bg-ctp-surface0'
        : ''}">
      <span class="font-semibold">{label}</span>
      {#if !!credentials.state.auth}
        <ChevronsUpDown class="-mr-1 size-4" />
      {/if}
    </DropdownMenu.Trigger>

    <DropdownMenu.Portal>
      <DropdownMenu.Content class="rounded-lg bg-ctp-crust p-2">
        <DropdownMenu.Group class="flex flex-col gap-2" aria-label={label}>
          {@render dropdownItem("/", "Home", ["⌘", "D"])}
          {@render dropdownItem("/timetable", "Timetable", ["⌘", "T"])}
          {@render dropdownItem("/debugging", "Debugging")}
        </DropdownMenu.Group>
      </DropdownMenu.Content>
    </DropdownMenu.Portal>
  </DropdownMenu.Root>

  <div class="flex h-full items-center pr-1.5">
    <div data-tauri-drag-region class="h-full flex-grow">&nbsp;</div>

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

{#snippet dropdownItem(/** @type {string} */ href, /** @type {string} */ name, /** @type {string[]} */ kbd = [])}
  <DropdownMenu.Item
    class="flex items-center justify-between gap-4 rounded-md px-2 py-1 hover:bg-ctp-surface0"
    onSelect={() => {
      goto(href);
    }}>
    <span class="text-ctp-text">{name}</span>
    <div class="flex items-center gap-1">
      {#each kbd as key}
        <kbd>{key}</kbd>
      {/each}
    </div>
  </DropdownMenu.Item>
{/snippet}
