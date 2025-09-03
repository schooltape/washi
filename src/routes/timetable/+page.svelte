<script lang="ts">
  import { cache } from "$lib/store";
  import Timetable from "$widgets/Timetable.svelte";
  import { Clock } from "@lucide/svelte";
  import { onMount } from "svelte";

  onMount(async () => {
    await cache.timetable.update();
  });
</script>

<main>
  <h1 class="flex items-center gap-2"><Clock class="stroke-ctp-pink" /> Timetable</h1>

  <Timetable />
</main>
