<script lang="ts">
  import { cache, settings } from "$lib/store";
  import { School } from "@lucide/svelte";
  import { onMount } from "svelte";
  import { getDay, format, differenceInMinutes, differenceInSeconds, getTime } from "date-fns";
  import { getCtx } from "$lib/store/credentials.svelte";
  import type { SchoolboxClass, SchoolboxTimetableEvent } from "serrator/types";

  type Event = SchoolboxTimetableEvent & { info: SchoolboxClass };
  let timetable: Event[][] = $state(Array.from({ length: 7 }, () => []));

  const day = getDay(new Date());

  function getFormattedTime(date: Date) {
    return format(date, "h:mm aaa");
  }

  function getProgress(start: Date, end: Date) {
    const now = new Date();
    const duration = differenceInSeconds(end, start);
    const elapsed = differenceInSeconds(now, start);

    return Math.min(Math.max(0, elapsed / duration), 1);
  }

  onMount(async () => {
    const ctx = await getCtx();
    console.log("ctx", ctx);

    const classes = await cache.classes.get();

    const tt = await cache.timetable.get();
    for (const entry of tt) {
      const dayIndex = getDay(entry.start); // 0-6
      const classInfo = classes.find((c) => c.code === entry.code);
      if (!classInfo) throw new Error("class info not found for code: " + entry.code);
      timetable[dayIndex].push({
        ...entry,
        info: classInfo,
      });
    }

    console.log(timetable[day]);
  });

  console.log("timetable", timetable);
</script>

<div class="m-8 flex flex-col overflow-clip rounded-xl border-1 border-ctp-surface0 bg-ctp-mantle">
  {#each timetable[day] as entry, i}
    <div class="hover:bg-ctp-surface0 {i < timetable[day].length - 1 ? 'border-b border-ctp-surface0' : ''}">
      <div class="flex items-center justify-between p-2">
        <div class="flex flex-col">
          <span class="font-semibold">
            <!-- removed text proceeding and including the first dash -->
            {entry.info.name.replace(/^.*-\s*/, "")}
          </span>
          <span class="text-xs text-ctp-subtext0">@ {entry.location}</span>
        </div>
        <span class="text-xs text-ctp-subtext0">{getFormattedTime(entry.start)} - {getFormattedTime(entry.end)}</span>
      </div>
    </div>
  {/each}
</div>
