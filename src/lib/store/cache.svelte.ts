import { fetcher, scraper } from "$lib/fetch";
import { LazyStore } from "@tauri-apps/plugin-store";
import { endOfWeek, startOfWeek } from "date-fns";
import { getDashboard, getHomepage } from "serrator/scrapers";
import type { SchoolboxDashboard, SchoolboxEvent, SchoolboxHomepage } from "serrator/types";
import { getCalendar } from "serrator/wrappers";

type CacheData = {
  dashboard?: SchoolboxDashboard;
  timetable?: SchoolboxEvent[];
  // key represents the numeric id of the homepage
  homepages?: Record<string, SchoolboxHomepage>;
};

/**
 * provides methods to update specific cache entries
 *
 * @example
 * // updates the value of Cache.timetable which then updates the store (and is synced with the state automatically)
 * cache.updateTimetable();
 *
 * // access the data from the Svelte state rune
 * $inspect(cache.timetable);
 *
 * @example
 * // initiate the default cache values
 * cache.init();
 */
class Cache {
  private defaults: CacheData = {};

  public state = $state(this.defaults);
  public store: LazyStore;
  public initialised: boolean = $state(false);

  public homepage: HomepageCache;
  public dashboard: DashboardCache;
  public timetable: TimetableCache;

  constructor() {
    this.store = new LazyStore("cache.json", { defaults: this.defaults });
    this.store.onChange(() => this.sync());
    this.homepage = new HomepageCache(this);
    this.dashboard = new DashboardCache(this);
    this.timetable = new TimetableCache(this);
  }

  /**
   * syncs the values of the LazyStore with the Svelte state rune
   */
  async sync() {
    this.initialised = true;
    Object.assign(this.state, Object.fromEntries(await this.store.entries()));
    // [TODO] does this work?
    // this.state = Object.fromEntries(await this.store.entries());
  }

  public async update<T>(key: string, fetcher: () => Promise<T>) {
    const value = await fetcher();
    this.store.set(key, value);
    // store state will be updated automatically (onChange)
  }

  public async get<T>(key: string): Promise<T | undefined> {
    return await this.store.get(key);
  }
}

class DashboardCache {
  constructor(private cache: Cache) {
    this.cache = cache;
  }

  async get(): Promise<SchoolboxDashboard> {
    const cached = await this.cache.get<SchoolboxDashboard>("dashboard");
    if (cached) return cached;
    await this.update();
    return (await this.cache.get("dashboard")) as SchoolboxDashboard;
  }

  async update() {
    await this.cache.update("dashboard", () => scraper("/", getDashboard));
  }
}

class TimetableCache {
  constructor(private cache: Cache) {
    this.cache = cache;
  }

  async get(): Promise<SchoolboxEvent[]> {
    const cached = await this.cache.get<SchoolboxEvent[]>("timetable");
    if (cached) return cached;
    await this.update();
    return (await this.cache.get("timetable")) as SchoolboxEvent[];
  }

  async update() {
    const date = new Date();
    await this.cache.update("timetable", async () => {
      const dashboard = await this.cache.dashboard.get();
      return getCalendar(fetcher, dashboard.user.id, startOfWeek(date), endOfWeek(date), true);
    });
  }
}

class HomepageCache {
  constructor(private cache: Cache) {
    this.cache = cache;
  }

  async get(id: string): Promise<SchoolboxHomepage> {
    const cached = await this.cache.get<SchoolboxHomepage>(`homepage-${id}`);
    if (cached) return cached;
    await this.update(id);
    return (await this.cache.get(`homepage-${id}`)) as SchoolboxHomepage;
  }

  async update(id: string) {
    await this.cache.update(`homepage-${id}`, () => scraper(`/homepage/${id}`, getHomepage));
  }
}

export const cache = new Cache();
