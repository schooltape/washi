<script lang="ts">
  import { store } from "$lib/store";
  import { onMount } from "svelte";
  import Button from "../../components/Button.svelte";

  let entries: [key: string, value: unknown][] = [];

  onMount(async () => {
    entries = await store.entries();
  });
</script>

<main class="p-4">
  <h1>Debugging</h1>
  <p>This page exists purely for debugging purposes and will be excluded from production builds.</p>

  <h2>Store</h2>

  <table class="min-w-full divide-y divide-ctp-overlay0 border border-ctp-overlay0">
    <thead class="bg-ctp-mantle">
      <tr class="divide-x">
        <th class="border-b border-ctp-overlay0 px-4 py-2 text-left">Key</th>
        <th class="border-b border-ctp-overlay0 px-4 py-2 text-left">Value</th>
      </tr>
    </thead>
    <tbody class="divide-y divide-ctp-overlay0">
      {#each entries as [key, value]}
        <tr class="divide-x divide-ctp-overlay0">
          <td class="px-4 py-2">{key}</td>
          <td class="max-w-xs truncate px-4 py-2">{JSON.stringify(value)}</td>
        </tr>
      {/each}
    </tbody>
  </table>

  <Button onclick={() => store.reset()}>Reset Store</Button>
</main>
