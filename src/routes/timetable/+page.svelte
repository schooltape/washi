<script lang="ts">
  import { cache } from "$lib/store";
  import { Clock, School } from "@lucide/svelte";
  import { Tabs } from "bits-ui";
  import { getDay, format, differenceInMinutes } from "date-fns";
  import type { SchoolboxEvent } from "serrator/types";
  import { onMount } from "svelte";

  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const selectedDay = $state(days[getDay(new Date())]);

  onMount(async () => {
    await cache.timetable.update();
  });

  let timetableDays = $derived(
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

  function getTime(date: Date) {
    return format(date, "h:mm aaa");
  }
</script>

<main>
  <h1 class="flex items-center gap-2"><Clock class="stroke-ctp-pink" /> Timetable</h1>

  <Tabs.Root value={selectedDay}>
    <Tabs.List class="flex w-full gap-2 border border-ctp-surface0 p-1 text-sm leading-[0.01em] font-semibold">
      {#each days as day}
        <Tabs.Trigger
          value={day}
          class="h-8 w-24 rounded-md py-2 transition-colors duration-300 data-[state=active]:bg-ctp-pink data-[state=active]:text-ctp-base"
          >{day}</Tabs.Trigger>
      {/each}
    </Tabs.List>
    {#if timetableDays}
      {#each timetableDays as timetable, day}
        <Tabs.Content value={days[day]} class="relative w-full p-4" style="min-height: {timetable.length * 100}px;">
          {#if timetable.length === 0}
            No events scheduled for {days[day]}
          {/if}

          <ul>
            {#each timetable as item, i}
              {@const length = differenceInMinutes(item?.end ?? item.start, item.start)}
              <li>
                <!-- timeline item -->
                <div class="min-h-lg flex items-stretch gap-8 rounded-md px-4 hover:bg-ctp-surface0">
                  <!-- times -->
                  <div class="py-4">
                    <div
                      class="flex h-full w-14 flex-col items-center justify-between text-sm whitespace-nowrap text-ctp-subtext0">
                      <span>{getTime(item.start)}</span>
                      {#if item.end}
                        <span>{getTime(item.end)}</span>
                      {/if}
                    </div>
                  </div>
                  <!-- timeline -->
                  <div class="flex flex-col items-center">
                    <!-- connector -->
                    <hr class="min-h-2 w-0.5 flex-grow bg-ctp-pink {i === 0 ? 'invisible' : ''}" />
                    <!-- dot -->
                    <!-- {length} -->
                    <span
                      class="grid w-8 place-items-center rounded-full bg-ctp-pink"
                      style="min-height: {50 + Math.max(length - 30, 0) * 3}px">
                      <School class="stroke-ctp-mantle" />
                    </span>
                    <!-- connector -->
                    <hr class="min-h-2 w-0.5 flex-grow bg-ctp-pink {i === timetable.length - 1 ? 'invisible' : ''}" />
                  </div>
                  <!-- content -->
                  <div class="flex-grow">
                    <div class="flex h-full items-center">
                      <span class="font-sm font-semibold">{item.title}</span>
                    </div>
                  </div>
                </div>
              </li>
            {/each}
          </ul>
        </Tabs.Content>
      {/each}
    {/if}
  </Tabs.Root>
</main>
