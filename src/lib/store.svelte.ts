import { LazyStore } from "@tauri-apps/plugin-store";
import type { StoreData } from "./store";

const defaults: StoreData = {
  stateVersion: 1,
  auth: {
    jwt: null,
    url: null,
  },
  cache: {},
  // theme: {
  //   sync: true,
  //   flavour: "macchiato",
  //   accent: "pink"
  // },
};

class Store {
  public state: StoreData = $state(defaults);
  store: LazyStore;

  constructor() {
    this.store = new LazyStore("settings.json", { defaults });

    this.store.onChange(() => this.sync());
  }

  async sync() {
    Object.assign(this.state, Object.fromEntries(await this.store.entries()));
  }
}

export const store = new Store();
