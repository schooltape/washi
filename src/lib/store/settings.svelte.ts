import { PersistentStore } from "./store.svelte";

type SettingsData = {
  stateVersion: number;
  // theme: {
  //   sync: boolean;
  //   flavour: string;
  //   accent: string;
  // }
};

class Settings extends PersistentStore<SettingsData> {
  constructor() {
    super("settings.json", {
      stateVersion: 1,
      // theme: {
      //   sync: true,
      //   flavour: "macchiato",
      //   accent: "pink"
      // },
    });
  }
}

export const settings = new Settings();
