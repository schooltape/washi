<script lang="ts">
  import { settings } from "$lib/store";
  import { flavorEntries, flavors, type AccentName } from "@catppuccin/palette";
  import Tabs from "./Tabs.svelte";
  import { Tabs as BitsTabs } from "bits-ui";

  type Props = (
    | { selectedAccent: AccentName; accentCallback: (accent: AccentName) => void }
    | { selectedAccent?: undefined; accentCallback?: undefined }
  ) & { showTabs?: boolean };

  let { selectedAccent, accentCallback, showTabs = false }: Props = $props();
</script>

<Tabs
  {showTabs}
  items={Object.fromEntries(flavorEntries.map((x) => [x[0], `${x[1].emoji} ${x[1].name}`]))}
  bind:selectedItem={settings.state.theme.flavour}>
  {#each flavorEntries as flavor}
    <BitsTabs.Content value={flavor[0]}>
      {@const flavourData = flavors[flavor[0]]}
      {@const accents = Object.values(flavourData.colors).filter((x) => x.accent === true)}

      <div class="m-4 inline-grid grid-flow-col grid-rows-2 gap-2">
        {#each accents as accent}
          {@const accentId = accent.name.toLowerCase() as AccentName}
          <button
            aria-label={accent.name}
            style:background-color={accent.hex}
            class:outline-3={selectedAccent ? selectedAccent === accentId : accentId === settings.state.theme.accent}
            class="aspect-square size-6 rounded-full outline-ctp-overlay0"
            onclick={() => {
              if (!selectedAccent) {
                settings.state.theme.accent = accentId;
              } else {
                selectedAccent = accentId;
                accentCallback?.(accentId);
              }
            }}>
          </button>
        {/each}
      </div>
    </BitsTabs.Content>
  {/each}
</Tabs>
