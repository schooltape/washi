import type { AccentName, FlavorName } from "@catppuccin/palette";
import { PersistentStore } from "./store.svelte";

interface ClassSettings {
  colour: AccentName;
  icon:
    | "maths"
    | "english"
    | "language"
    | "art"
    | "physics"
    | "chemistry"
    | "biology"
    | "geography"
    | "history"
    | "tech"
    | "economics"
    | "psychology"
    | "religion"
    | "philosophy"
    | "music";
}

type SettingsData = {
  stateVersion: number;
  // class codes and customisation data
  classes: Record<string, ClassSettings>;
  theme: {
    sync: boolean;
    flavour: FlavorName;
    accent: AccentName;
  };
};

class Settings extends PersistentStore<SettingsData> {
  constructor() {
    super("settings.json", {
      stateVersion: 1,
      classes: {},
      theme: {
        sync: true,
        flavour: "macchiato", // i made the app so i get to choose the defaults c:
        accent: "pink",
      },
    });
  }
}

export const settings = new Settings();
