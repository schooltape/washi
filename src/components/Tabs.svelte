<script lang="ts">
  import { Tabs, type WithoutChild } from "bits-ui";
  import type { Snippet } from "svelte";

  type Props = Tabs.RootProps & {
    selectedItem: string;
    // items with their ids and labels
    items: Record<string, string>;
    children: Snippet;
    // contentProps?: WithoutChild<Tabs.ContentProps>;
    triggerProps?: WithoutChild<Tabs.TriggerProps>;
    // ...other component props if you wish to pass them
  };

  let { selectedItem = $bindable(), items, children, triggerProps, ...restProps }: Props = $props();
</script>

<Tabs.Root bind:value={selectedItem}>
  <Tabs.List class="flex w-full gap-2 border border-ctp-surface0 p-1 text-sm leading-[0.01em] font-semibold">
    {#each Object.entries(items) as [id, label]}
      <Tabs.Trigger
        {...triggerProps}
        value={id}
        class="h-8 w-24 rounded-md py-2 transition-colors duration-300 data-[state=active]:bg-(--ctp-accent) data-[state=active]:text-ctp-base"
        >{label}</Tabs.Trigger>
    {/each}
  </Tabs.List>

  {@render children()}
</Tabs.Root>
