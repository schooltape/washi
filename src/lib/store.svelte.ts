import { LazyStore } from "@tauri-apps/plugin-store";
import { endOfWeek, startOfWeek } from "date-fns";
import { getDashboard } from "serrator/scrapers";
import type { SchoolboxDashboard, SchoolboxEvent } from "serrator/types";
import { getCalendar } from "serrator/wrappers";
import { fetcher, scraper } from "./fetch";
import type { StoreData } from "./store";

const defaults: StoreData = {
  stateVersion: 1,
  auth: null,
  cache: {},
  // theme: {
  //   sync: true,
  //   flavour: "macchiato",
  //   accent: "pink"
  // },
};

class Store {
  public state: StoreData = $state(defaults);
  public store: LazyStore;
  public initialised: boolean = $state(false);
  dashboard: SchoolboxDashboard | null = $state(null);
  timetable: SchoolboxEvent[] | null = $state(null);

  constructor() {
    this.store = new LazyStore("settings.json", { defaults });

    this.store.onChange(() => this.sync());
  }

  async sync() {
    this.initialised = true;
    Object.assign(this.state, Object.fromEntries(await this.store.entries()));
    if (this.state.auth !== null) {
      await this.updateDashboard();
      await this.updateTimetable();
    } else {
      console.warn("not syncing store, no authentication data found");
    }
  }

  cache<T>(key: string, value: T) {
    this.state.cache[key] = value;
    this.store.set(key, value);
  }

  async updateDashboard() {
    await this.updateCache("dashboard", () => scraper("/", getDashboard));
  }

  async updateTimetable() {
    const date = new Date();
    await this.updateCache("timetable", () =>
      getCalendar(fetcher, this.state.cache["dashboard"]?.user?.id, startOfWeek(date), endOfWeek(date), true),
    );
  }

  private async updateCache<T>(key: string, fetcher: () => Promise<T>) {
    const value = await fetcher();
    (this as any)[key] = value;
    this.state.cache[key] = value;
  }

  reset() {
    this.store.reset();
    this.sync();
  }
}

export const store = new Store();
