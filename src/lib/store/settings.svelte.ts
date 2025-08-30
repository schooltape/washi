import { LazyStore } from "@tauri-apps/plugin-store";

type SettingsData = {
  stateVersion: number;
  // theme: {
  //   sync: boolean;
  //   flavour: string;
  //   accent: string;
  // }
  auth: {
    jwt: string;
    url: string;
  } | null;
};

class Settings {
  private defaults = {
    stateVersion: 1,
    auth: null,
    // theme: {
    //   sync: true,
    //   flavour: "macchiato",
    //   accent: "pink"
    // },
  };

  public state: SettingsData = $state(this.defaults);
  public store: LazyStore;
  public initialised: boolean = $state(false);

  constructor() {
    this.store = new LazyStore("settings.json", { defaults: this.defaults });
    this.store.onChange(() => this.sync());
  }

  /**
   * syncs the values of the LazyStore with the Svelte state rune
   */
  async sync() {
    this.initialised = true;
    Object.assign(this.state, Object.fromEntries(await this.store.entries()));
  }
}

export const settings = new Settings();
