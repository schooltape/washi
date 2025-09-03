<script lang="ts">
  import { cache } from "$lib/store";
  import { School } from "@lucide/svelte";
  import { Tabs } from "bits-ui";
  import { onMount } from "svelte";

  import { getDay, format, differenceInMinutes, differenceInSeconds, addSeconds, getTime } from "date-fns";
  import type { SchoolboxEvent } from "serrator/types";

  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const selectedDay = $state(days[getDay(new Date())]);
  let now = $state(new Date());

  let dailyTimetables = $derived(
    cache.state.timetable?.reduce(
      (acc, event) => {
        const day = new Date(event.start).getDay();
        if (!acc[day]) acc[day] = [];
        acc[day].push(event);
        return acc;
      },
      Array.from({ length: 7 }, () => [] as SchoolboxEvent[]),
    ),
  );

  function getTimetableWithBreaks(timetables: SchoolboxEvent[][]) {
    return timetables.map((timetable) => {
      return timetable.flatMap((item, i, array) => {
        if (i === array.length - 1) return [item];

        const next = array[i + 1];
        if (differenceInMinutes(next.start, item.end) > 10) {
          // greater than 10 minute break
          return [
            item,
            {
              title: "Break",
              start: item.end,
              end: next.start,
              allDay: false,
            },
          ];
        }
        return [item];
      });
    });
  }

  function getFormattedTime(date: Date) {
    return format(date, "h:mm aaa");
  }

  function getProgress(start: Date, end: Date) {
    const duration = differenceInSeconds(end, start);
    const elapsed = differenceInSeconds(now, start);

    return Math.min(Math.max(0, elapsed / duration), 1);
  }

  function getMidtime(start: Date, end: Date): Date {
    const midTime = new Date((getTime(start) + getTime(end)) / 2);
    return midTime;
  }

  function getBackground(progress: number) {
    if (progress === 0) return "var(--catppuccin-color-overlay0)";
    if (progress === 1) return "var(--catppuccin-color-pink)";
    return `linear-gradient(
      to bottom,
      var(--catppuccin-color-pink) 0%,
      var(--catppuccin-color-pink) ${progress * 100}%,
      var(--catppuccin-color-overlay0) ${progress * 100}%,
      var(--catppuccin-color-overlay0) 100%
    )`;
  }

  onMount(() => {
    setInterval(() => {
      now = new Date();
    }, 1000);
  });
</script>

<Tabs.Root value={selectedDay}>
  <Tabs.List class="flex w-full gap-2 border border-ctp-surface0 p-1 text-sm leading-[0.01em] font-semibold">
    {#each days as day}
      <Tabs.Trigger
        value={day}
        class="h-8 w-24 rounded-md py-2 transition-colors duration-300 data-[state=active]:bg-ctp-pink data-[state=active]:text-ctp-base"
        >{day}</Tabs.Trigger>
    {/each}
  </Tabs.List>

  {#if dailyTimetables}
    {#each getTimetableWithBreaks(dailyTimetables) as timetable, day}
      <Tabs.Content value={days[day]} class="relative w-full p-4" style="min-height: {timetable.length * 100}px;">
        {#if timetable.length === 0}
          No events scheduled for {days[day]}
        {/if}

        <ul>
          {#each timetable as item, i}
            {@const length = differenceInMinutes(item.end, item.start)}
            <!-- timeline item -->
            <li class="min-h-lg flex items-stretch gap-8 rounded-md px-4 hover:bg-ctp-surface0">
              <!-- times -->
              <div class="py-4">
                <div
                  class="flex h-full w-14 flex-col items-center justify-between text-sm whitespace-nowrap text-ctp-subtext0">
                  <span>{getFormattedTime(item.start)}</span>
                  {#if item.end}
                    <span>{getFormattedTime(item.end)}</span>
                  {/if}
                </div>
              </div>

              <!-- timeline -->
              <div class="flex flex-col items-center">
                <!-- connector -->
                {#if i > 0}
                  {@render connector(getProgress(getMidtime(timetable[i - 1].end, item.start), item.start))}
                {:else}
                  <span class="min-h-2 flex-grow"></span>
                {/if}

                <!-- dot -->
                <span
                  class="grid w-8 place-items-center rounded-full"
                  style="
                      min-height: {50 + Math.max(length - 30, 0) * 3}px;
                      background: {getBackground(getProgress(item.start, item.end))}
                    ">
                  <School class={getProgress(item.start, item.end) > 0.5 ? "stroke-ctp-mantle" : "stroke-ctp-text"} />
                </span>

                <!-- connector -->
                {#if i < timetable.length - 1}
                  {@render connector(
                    getProgress(item.end, getMidtime(item.end, timetable[i + 1].start)),
                    differenceInMinutes(timetable[i + 1].start, item.end) > 10,
                  )}
                {:else}
                  <span class="min-h-2 flex-grow"></span>
                {/if}
              </div>

              <!-- content -->
              <div class="flex-grow">
                <div class="flex h-full items-center">
                  <span class="font-sm font-semibold">{item.title}</span>
                </div>
              </div>
            </li>
          {/each}
        </ul>
      </Tabs.Content>
    {/each}
  {/if}
</Tabs.Root>

{#snippet connector(progress: number)}
  <span class="min-h-2 w-0.5 flex-grow" style="background: {getBackground(progress)}"></span>
{/snippet}
