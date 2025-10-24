<script lang="ts">
  import { cache } from "$lib/store";
  import { onDestroy, onMount } from "svelte";
  import { getDay, format, differenceInSeconds, getTime, addDays, startOfWeek } from "date-fns";
  import type { SchoolboxClass, SchoolboxTimetableEvent } from "serrator/types";
  import { getCtx } from "$lib/store/credentials.svelte";
  import { slide } from "svelte/transition";
  import { ExternalLink } from "@lucide/svelte";

  type Event = SchoolboxTimetableEvent & { info: SchoolboxClass };
  type StartTime = number; // timestamp in milliseconds

  let timetable: Record<StartTime, Event[]>[] = $state(Array.from({ length: 7 }, () => ({})));
  // $inspect(timetable);

  let now = $state(new Date());
  // $inspect(now);
  let selectedDate = $state(new Date());

  let dayInProgress = $derived.by(() => {
    const times = Object.keys(timetable[getDay(selectedDate)]).map(Number);
    if (times.length === 0) return false;
    return times[0] < getTime(now) && getTime(now) < times[times.length - 1];
  });

  function getFormattedTime(date: Date) {
    return format(date, "h:mm aaa");
  }

  function getProgress(start: Date, end: Date) {
    const duration = differenceInSeconds(end, start);
    const elapsed = differenceInSeconds(now, start);

    return Math.min(Math.max(0, elapsed / duration), 1);
  }

  function movePeriodFocus(direction: "up" | "down" | "none") {
    const eventRefs = Array.from(document.querySelectorAll<HTMLAnchorElement>("[data-event-link]"));
    const focusedIndex = eventRefs.findIndex((ref) => ref === document.activeElement);

    if (direction === "none") {
      if (focusedIndex !== -1) {
        eventRefs[focusedIndex].blur();
      }
      return;
    }
    let targetIndex = 0;
    if (focusedIndex === -1) {
      // targetIndex = 0;
    } else {
      if (direction === "down") {
        targetIndex = focusedIndex + 1;
      } else {
        targetIndex = focusedIndex - 1;
      }
    }
    eventRefs[targetIndex]?.focus();
  }

  // keyboard shortcuts
  function handleKeydown(e: KeyboardEvent) {
    if (e.code === "KeyJ") {
      selectedDate = addDays(selectedDate, -1);
    } else if (e.code === "Semicolon") {
      selectedDate = addDays(selectedDate, 1);
    } else if (e.code === "KeyK") {
      movePeriodFocus("down");
    } else if (e.code === "KeyL") {
      movePeriodFocus("up");
    } else if (e.code === "Escape") {
      movePeriodFocus("none");
    } else {
      return;
    }
    e.preventDefault();
  }

  let timeInterval: ReturnType<typeof setInterval>;
  onMount(async () => {
    const classes = await cache.classes.get();
    const tt = await cache.timetable.get();

    // populate timetable
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

    timeInterval = setInterval(() => {
      now = new Date();
    }, 1000);

    window.addEventListener("keydown", handleKeydown);
  });
  onDestroy(() => {
    clearInterval(timeInterval);
    window.removeEventListener("keydown", handleKeydown);
  });
</script>

<div class="m-8 flex flex-col overflow-clip rounded-xl border border-ctp-surface0 bg-ctp-mantle">
  <div class="flex w-full">
    {#each { length: 7 } as _, i}
      {@const isSelected = getDay(selectedDate) === i}
      {@const day = addDays(startOfWeek(now), i)}
      <button
        class:text-ctp-pink={isSelected}
        class="group relative grid flex-1 cursor-pointer place-items-center border-b border-ctp-surface0 p-2 text-xs transition-colors hover:bg-ctp-surface0"
        onclick={() => (selectedDate = addDays(startOfWeek(selectedDate), i))}>
        <span class="uppercase">{format(day, "EEE")}</span>
        <span>{format(day, "d")}</span>
        <div
          class="absolute bottom-0.5 left-1/2 h-0.5 w-0 -translate-x-1/2 rounded-full bg-ctp-pink transition-all duration-500 {isSelected
            ? 'w-8'
            : 'opacity-0 group-hover:w-3 group-hover:opacity-100'}">
        </div>
      </button>
    {/each}
  </div>

  {#each Object.values(timetable[getDay(selectedDate)]) as period, i}
    {@const inProgress = now >= new Date(period[0].start) && now < new Date(period[0].end)}
    {@const completed = now > new Date(period[0].end)}

    <div
      transition:slide
      class="relative w-full text-left transition-colors focus-within:bg-ctp-surface0 hover:bg-ctp-surface0 {i <
      Object.keys(timetable[getDay(selectedDate)]).length - 1
        ? 'border-b border-ctp-surface0'
        : ''}">
      <!-- progress bar -->
      {#if inProgress}
        <div
          class="pointer-events-none absolute top-0 left-0 h-full bg-ctp-pink-50/10"
          style="width: {getProgress(period[0].start, period[0].end) * 100}%">
        </div>
      {/if}

      <div class="z-10 flex items-center justify-between gap-2 px-4 py-2">
        <!-- indicator and events -->
        <div class="flex min-w-0 grow items-center gap-4">
          <!-- period indicator -->
          <div
            class="grid size-8 shrink-0 place-items-center rounded-full text-sm font-bold transition-colors {inProgress
              ? 'bg-ctp-pink text-ctp-base'
              : completed
                ? 'border border-ctp-surface1 bg-ctp-surface0/50 text-ctp-subtext0'
                : 'border border-ctp-pink/20 bg-ctp-pink-50/10 text-ctp-pink'}">
            {i + 1}
          </div>

          <!-- event details -->
          <div class="flex min-w-0 grow flex-col">
            {#each period as event}
              <a
                data-event-link
                href="https://{getCtx().domain}{period[0].info.url}"
                target="_blank"
                class="group flex flex-col">
                <span class="flex items-center gap-1">
                  <span
                    class="truncate font-semibold transition-colors group-focus-within:text-ctp-pink group-hover:text-ctp-pink"
                    class:text-ctp-subtext0={dayInProgress && completed}>
                    {event.info.name.replace(/^.*-\s*/, "")}
                  </span>
                  <ExternalLink
                    class="mb-0.5 size-4 shrink-0 stroke-ctp-overlay1 opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100" />
                </span>
                <span
                  class="text-xs text-ctp-subtext0 transition-colors group-focus-within:text-ctp-text group-hover:text-ctp-text"
                  >@ {event.location}</span>
              </a>
            {/each}
          </div>
        </div>

        <!-- period time -->
        <span class="text-xs whitespace-nowrap text-ctp-subtext0"
          >{getFormattedTime(period[0].start)} - {getFormattedTime(period[0].end)}</span>
      </div>
    </div>
  {:else}
    <p class="p-4 text-center text-ctp-subtext0">
      No classes scheduled for {format(selectedDate, "EEEE")}
    </p>
  {/each}
</div>
