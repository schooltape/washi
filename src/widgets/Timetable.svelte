<script lang="ts">
  import { cache, settings } from "$lib/store";
  import { School } from "@lucide/svelte";
  import { onMount } from "svelte";
  import { getDay, format, differenceInMinutes, differenceInSeconds, getTime } from "date-fns";
  import { getCtx } from "$lib/store/credentials.svelte";
  import type { SchoolboxClass, SchoolboxTimetableEvent } from "serrator/types";

  type Event = SchoolboxTimetableEvent & { info: SchoolboxClass };
  type StartTime = number; // timestamp in milliseconds

  let timetable: Record<StartTime, Event[]>[] = $state(Array.from({ length: 7 }, () => ({})));
  // $inspect(timetable);

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
    const classes = await cache.classes.get();

    const tt = await cache.timetable.get();
    for (const entry of tt) {
      const dayIndex = getDay(entry.start); // 0-6
      const classInfo = classes.find((c) => c.code === entry.code);
      if (!classInfo) throw new Error("class info not found for code: " + entry.code);

      const startTime = getTime(entry.start);
      if (!timetable[dayIndex][startTime]) {
        timetable[dayIndex][startTime] = [];
      }
      timetable[dayIndex][startTime].push({
        ...entry,
        info: classInfo,
      });
    }
  });
</script>

<div class="m-8 flex flex-col overflow-clip rounded-xl border-1 border-ctp-surface0 bg-ctp-mantle">
  {#each Object.values(timetable[day]) as period, i}
    <div
      class="flex items-center justify-between gap-2 p-2 hover:bg-ctp-surface0 {i <
      Object.keys(timetable[day]).length - 1
        ? 'border-b border-ctp-surface0'
        : ''}">
      <div class="flex min-w-0 flex-col gap-2">
        {#each period as event}
          <div class="flex flex-col">
            <span class="truncate font-semibold">
              {event.info.name.replace(/^.*-\s*/, "")}
            </span>
            <span class="text-xs text-ctp-subtext0">@ {event.location}</span>
          </div>
        {/each}
      </div>
      <span class="text-xs whitespace-nowrap text-ctp-subtext0"
        >{getFormattedTime(period[0].start)} - {getFormattedTime(period[0].end)}</span>
    </div>
  {/each}
</div>
