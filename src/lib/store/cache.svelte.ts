import { fetcher, scraper } from "$lib/fetch";
import { endOfWeek, startOfWeek } from "date-fns";
import { getDashboard, getHomepage } from "serrator/scrapers";
import type { SchoolboxDashboard, SchoolboxEvent, SchoolboxHomepage } from "serrator/types";
import { getCalendar } from "serrator/wrappers";
import { credentials } from "./credentials.svelte";
import { PersistentStore } from "./store.svelte";

type CacheData = {
  dashboard?: SchoolboxDashboard;
  timetable?: SchoolboxEvent[];
  // key represents the numeric id of the homepage
  homepages?: Record<string, SchoolboxHomepage>;
};

class Cache extends PersistentStore<CacheData> {
  homepage: CacheItem<SchoolboxHomepage>;
  dashboard: CacheItem<SchoolboxDashboard>;
  timetable: CacheItem<SchoolboxEvent[]>;

  constructor() {
    super("cache.json", {});
    this.homepage = new CacheItem<SchoolboxHomepage>(
      this,
      (id: string) => `homepage-${id}`,
      (id: string) => scraper(`/homepage/${id}`, getHomepage),
    );
    this.dashboard = new CacheItem<SchoolboxDashboard>(this, "dashboard", () => scraper("/", getDashboard));
    this.timetable = new CacheItem<SchoolboxEvent[]>(this, "timetable", async () => {
      const date = new Date();
      const dashboard = await this.dashboard.get();
      return getCalendar(fetcher, dashboard.user.id, startOfWeek(date), endOfWeek(date), true);
    });
  }

  async update<T>(key: string, fetcher: () => Promise<T>) {
    const value = await fetcher();
    this.store.set(key, value);
  }

  async get<T>(key: string): Promise<T | undefined> {
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
    credentials.state.status = { type: "syncing" };
    const key = typeof this.key === "function" ? this.key(...args) : this.key;
    await this.cache.update(key, () => this.updater(...args));
    credentials.state.status = { type: "synced" };
  }
}

export const cache = new Cache();
