<script lang="ts">
  import { invoke } from "@tauri-apps/api/core";
  import { onMount } from "svelte";
  import { fetch } from "@tauri-apps/plugin-http";
  import { fetcher, wrapper } from "$lib/fetch";
  import RangeCalendar from "../../components/RangeCalendar.svelte";
  import { type SchoolboxEvent } from "serrator/types";
  import { startOfWeek, endOfWeek } from "date-fns";
  import { getCalendar } from "serrator/wrappers";
  import { getDashboard } from "serrator/scrapers";

  let timetable: SchoolboxEvent[] = $state([]);

  onMount(async () => {
    // get start of week using https://react-spectrum.adobe.com/internationalized/date/index.html
    const date = new Date();

    try {
      const user = getDashboard(await (await fetcher("/")).text()).user;
      timetable = await getCalendar(fetcher, user.id, startOfWeek(date), endOfWeek(date), true);
    } catch (error) {
      console.error("Error fetching timetable:", error);
    }
  });
</script>

<main>
  <!-- <RangeCalendar /> -->

  {#if timetable}
    <div class="flex flex-col gap-4">
      {#each timetable as item}
        <p>{item.title}</p>
      {/each}
    </div>
  {:else}
    <p>Timetable not available.</p>
  {/if}
</main>
