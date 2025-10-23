<script lang="ts">
  import { cache } from "$lib/store";
  import { onMount } from "svelte";
  import { getDay, format, differenceInSeconds, getTime, addDays, startOfWeek } from "date-fns";
  import type { SchoolboxClass, SchoolboxTimetableEvent } from "serrator/types";

  type Event = SchoolboxTimetableEvent & { info: SchoolboxClass };
  type StartTime = number; // timestamp in milliseconds

  let timetable: Record<StartTime, Event[]>[] = $state(Array.from({ length: 7 }, () => ({})));
  // $inspect(timetable);

  let selectedDate = $state(new Date());
  // $inspect(selectedDate);

  let dayInProgress = $derived.by(() => {
    const times = Object.keys(timetable[getDay(selectedDate)]).map(Number);
    if (times.length === 0) return false;
    const now = getTime(new Date());
    return times[0] < now && now < times[times.length - 1];
  });

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

<div class="m-8 flex flex-col overflow-clip rounded-xl border border-ctp-surface0 bg-ctp-mantle">
  <div class="flex w-full">
    {#each { length: 7 } as _, i}
      {@const isSelected = getDay(selectedDate) === i}
      {@const day = addDays(startOfWeek(new Date()), i)}
      <button
        class:text-ctp-pink={isSelected}
        class="relative grid flex-1 cursor-pointer place-items-center border-b border-ctp-surface0 p-2 text-xs hover:bg-ctp-surface0"
        onclick={() => (selectedDate = addDays(startOfWeek(selectedDate), i))}>
        <span class="uppercase">{format(day, "EEE")}</span>
        <span>{format(day, "d")}</span>
        {#if isSelected}
          <div class="absolute bottom-0.5 left-1/2 h-0.5 w-8 -translate-x-1/2 rounded-full bg-ctp-pink"></div>
        {/if}
      </button>
    {/each}
  </div>
  {#each Object.values(timetable[getDay(selectedDate)]) as period, i}
    {@const now = new Date()}
    {@const inProgress = now >= period[0].start && now < period[0].end}
    {@const progress = getProgress(period[0].start, period[0].end)}

    <div
      class="relative flex items-center justify-between gap-2 px-4 py-2 hover:bg-ctp-surface0 {i <
      Object.keys(timetable[getDay(selectedDate)]).length - 1
        ? 'border-b border-ctp-surface0'
        : ''}">
      <!-- progress bar -->
      {#if inProgress}
        <div
          class="pointer-events-none absolute top-0 left-0 h-full bg-ctp-pink opacity-20"
          style="width: {progress * 100}%">
        </div>
      {/if}

      <div class="flex min-w-0 items-center gap-4">
        <!-- period indicator -->
        <div
          class="grid size-8 shrink-0 place-items-center rounded-full text-sm font-bold {inProgress
            ? 'bg-ctp-pink text-ctp-base'
            : 'bg-ctp-pink-50/10 text-ctp-pink'}">
          {i + 1}
        </div>

        <!-- event details -->
        <div class="flex min-w-0 flex-col">
          {#each period as event}
            <div class="flex flex-col">
              <span
                class="truncate font-semibold"
                class:text-ctp-subtext0={dayInProgress && new Date() > new Date(event.end)}>
                {event.info.name.replace(/^.*-\s*/, "")}
              </span>
              <span class="text-xs text-ctp-subtext0">@ {event.location}</span>
            </div>
          {/each}
        </div>
      </div>

      <!-- period time -->
      <span class="text-xs whitespace-nowrap text-ctp-subtext0"
        >{getFormattedTime(period[0].start)} - {getFormattedTime(period[0].end)}</span>
    </div>
  {:else}
    <p class="p-4 text-center text-ctp-subtext0">
      No classes scheduled for {format(selectedDate, "EEEE")}
    </p>
  {/each}
</div>
