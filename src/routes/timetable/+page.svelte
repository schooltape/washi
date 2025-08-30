<script lang="ts">
  import { cache } from "$lib/store";
  import { Clock } from "@lucide/svelte";
  import { onMount } from "svelte";

  onMount(() => {
    cache.timetable.update();
  });
</script>

<main>
  <h1 class="flex items-center gap-2"><Clock class="stroke-ctp-pink" /> Timetable</h1>

  {#if cache.state.timetable}
    <div class="flex flex-col gap-4">
      {#each cache.state.timetable as item}
        <p>{item.title}</p>
      {/each}
    </div>
  {/if}
</main>
