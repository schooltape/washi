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

class Cache {
  private defaults: CacheData = {};

  state = $state(this.defaults);
  store: LazyStore;
  initialised: boolean = $state(false);
  homepage: CacheItem<SchoolboxHomepage>;
  dashboard: CacheItem<SchoolboxDashboard>;
  timetable: CacheItem<SchoolboxEvent[]>;

  constructor() {
    this.store = new LazyStore("cache.json", { defaults: this.defaults });
    this.store.onChange(() => this.sync());
    this.homepage = new CacheItem<SchoolboxHomepage>(
      cache,
      (id: string) => `homepage-${id}`,
      (id: string) => scraper(`/homepage/${id}`, getHomepage),
    );
    this.dashboard = new CacheItem<SchoolboxDashboard>(cache, "dashboard", () => scraper("/", getDashboard));
    this.timetable = new CacheItem<SchoolboxEvent[]>(cache, "timetable", async () => {
      const date = new Date();
      const dashboard = await cache.dashboard.get();
      return getCalendar(fetcher, dashboard.user.id, startOfWeek(date), endOfWeek(date), true);
    });
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

class CacheItem<T> {
  constructor(
    private cache: Cache,
    private key: string | ((...args: any[]) => string),
    private updater: (...args: any[]) => Promise<T>,
  ) {}

  async get(...args: any[]): Promise<T> {
    const key = typeof this.key === "function" ? this.key(...args) : this.key;
    const cached = await this.cache.get<T>(key);
    if (cached) return cached;
    await this.update(...args);
    return (await this.cache.get(key)) as T;
  }

  async update(...args: any[]) {
    const key = typeof this.key === "function" ? this.key(...args) : this.key;
    await this.cache.update(key, () => this.updater(...args));
  }
}

export const cache = new Cache();
