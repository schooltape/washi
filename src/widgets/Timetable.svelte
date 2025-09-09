<script lang="ts">
  import { cache, settings } from "$lib/store";
  import { School } from "@lucide/svelte";
  import { onMount } from "svelte";
  import { Tabs as BitsTabs } from "bits-ui";
  import { getDay, format, differenceInMinutes, differenceInSeconds, getTime } from "date-fns";
  import type { SchoolboxEvent } from "serrator/types";
  import Dialog from "$components/Dialog.svelte";
  import Tabs from "$components/Tabs.svelte";

  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  let selectedDay = $state(days[getDay(new Date())]);
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
    const overlay = "var(--catppuccin-color-overlay0)";
    const accent = `var(--catppuccin-color-${settings.state.theme.accent})`;
    if (progress === 0) return overlay;
    if (progress === 1) return accent;
    return `linear-gradient(
      to bottom,
      ${accent} 0%,
      ${accent} ${progress * 100}%,
      ${overlay} ${progress * 100}%,
      ${overlay} 100%
    )`;
  }

  onMount(() => {
    setInterval(() => {
      now = new Date();
    }, 1000);
  });
</script>

<Tabs bind:selectedItem={selectedDay} items={Object.fromEntries(days.map((x) => [x, x]))}>
  {#if dailyTimetables}
    {#each getTimetableWithBreaks(dailyTimetables) as timetable, day}
      <BitsTabs.Content class="relative w-full" value={days[day]}>
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
                <Dialog
                  triggerProps={{
                    class: "grid w-8 place-items-center rounded-full",
                    style: `
                    min-height: ${50 + Math.max(length - 30, 0) * 3}px;
                    background: ${getBackground(getProgress(item.start, item.end))}
                  `,
                  }}>
                  {#snippet trigger()}
                    <School class={getProgress(item.start, item.end) > 0.5 ? "stroke-ctp-mantle" : "stroke-ctp-text"} />
                  {/snippet}
                  {#snippet title()}
                    Class settings
                  {/snippet}
                  {#snippet description()}
                    Description
                  {/snippet}
                  What happens here
                </Dialog>

                <!-- connector -->
                {#if i < timetable.length - 1}
                  {@render connector(getProgress(item.end, getMidtime(item.end, timetable[i + 1].start)))}
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
      </BitsTabs.Content>
    {/each}
  {/if}
</Tabs>

{#snippet connector(progress: number)}
  <span class="min-h-2 w-0.5 flex-grow" style="background: {getBackground(progress)}"></span>
{/snippet}
