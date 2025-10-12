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
    showTabs?: boolean;
    // ...other component props if you wish to pass them
  };

  let { selectedItem = $bindable(), items, children, triggerProps, showTabs = true, ...restProps }: Props = $props();
</script>

<Tabs.Root bind:value={selectedItem} class="flex flex-col gap-4">
  {#if showTabs}
    <Tabs.List
      class="flex gap-2 rounded-lg border border-ctp-surface0 bg-ctp-crust p-2 text-sm leading-[0.01em] font-semibold">
      {#each Object.entries(items) as [id, label]}
        <Tabs.Trigger
          {...triggerProps}
          value={id}
          class="h-8 flex-grow rounded-md border-1 border-ctp-surface0 bg-ctp-mantle px-2 py-2 transition-colors duration-300 data-[state=active]:border-(--ctp-accent) data-[state=active]:bg-(--ctp-accent)/20 data-[state=active]:text-ctp-text"
          >{label}</Tabs.Trigger>
      {/each}
    </Tabs.List>
  {/if}

  {@render children()}
</Tabs.Root>
