<script lang="ts">
  import { invalidateAll } from "$app/navigation";
  import Button from "$components/Button.svelte";
  import ThemePicker from "$components/ThemePicker.svelte";
  import { cache, credentials, settings } from "$lib/store";
  import { path } from "@tauri-apps/api";
  import { onMount } from "svelte";

  onMount(async () => {
    const appDataPath = await path.appDataDir();
    console.log(appDataPath);
  });
</script>

<main class="p-4">
  <ThemePicker showTabs />

  <h1>Debugging</h1>
  <p>This page exists purely for debugging purposes and will be excluded from production builds.</p>

  <h2>Settings</h2>
  {@render stateTable(settings.state)}
  <Button
    onclick={async () => {
      await settings.reset();
      invalidateAll();
    }}>Reset Store</Button>

  <h2>Cache</h2>
  {@render stateTable(cache.state)}
  <Button
    onclick={async () => {
      await cache.reset();
      invalidateAll();
    }}>Reset Store</Button>

  <h2>Credentials</h2>
  {@render stateTable(credentials.state)}
  <Button
    onclick={async () => {
      await credentials.reset();
      invalidateAll();
    }}>Reset Store</Button>
</main>

{#snippet stateTable(state: Record<string, any>)}
  <table class="min-w-full divide-y divide-ctp-overlay0 border border-ctp-overlay0">
    <thead class="bg-ctp-mantle">
      <tr class="divide-x">
        <th class="border-b border-ctp-overlay0 px-4 py-2 text-left">Key</th>
        <th class="border-b border-ctp-overlay0 px-4 py-2 text-left">Value</th>
      </tr>
    </thead>
    <tbody class="divide-y divide-ctp-overlay0">
      {#each Object.entries(state) as [key, value]}
        <tr class="divide-x divide-ctp-overlay0">
          <td class="px-4 py-2">{key}</td>
          <td class="max-w-xs truncate px-4 py-2">{JSON.stringify(value)}</td>
        </tr>
      {/each}
    </tbody>
  </table>
  <Button
    onclick={() => {
      console.log($state.snapshot(state));
    }}>Log Store</Button>
{/snippet}
