<script lang="ts">
  import { store } from "$lib/store.svelte";
</script>

<main>
  {#if store.timetable}
    <div class="flex flex-col gap-4">
      {#each store.timetable as item}
        <p>{item.title}</p>
      {/each}
    </div>
  {/if}
</main>
