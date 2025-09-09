<script lang="ts">
  import { settings } from "$lib/store";
  import { flavorEntries, flavors, type AccentName } from "@catppuccin/palette";
  import Tabs from "./Tabs.svelte";
  import { Tabs as BitsTabs } from "bits-ui";
</script>

<Tabs
  items={Object.fromEntries(flavorEntries.map((x) => [x[0], `${x[1].emoji} ${x[1].name}`]))}
  bind:selectedItem={settings.state.theme.flavour}>
  {#each flavorEntries as flavor}
    <BitsTabs.Content value={flavor[0]}>
      {@const flavourData = flavors[flavor[0]]}
      {@const accents = Object.values(flavourData.colors).filter((x) => x.accent === true)}

      <div class="m-4 inline-grid grid-flow-col grid-rows-2 gap-2">
        {#each accents as accent}
          <button
            aria-label={accent.name}
            style:background-color={accent.hex}
            class:outline-3={accent.name.toLowerCase() === settings.state.theme.accent}
            class="aspect-square size-6 rounded-full outline-ctp-overlay0"
            onclick={() => {
              settings.state.theme.accent = accent.name.toLowerCase() as AccentName;
            }}>
          </button>
        {/each}
      </div>
    </BitsTabs.Content>
  {/each}
</Tabs>
