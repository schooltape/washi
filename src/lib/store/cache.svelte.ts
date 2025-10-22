import { getClasses, getDashboard, getHomepage } from "serrator/scrapers";
import {
  type SchoolboxClass,
  type SchoolboxDashboard,
  type SchoolboxHomepage,
  type SchoolboxTimetableEvent,
} from "serrator/types";
import { getTimetable, registerMobile } from "serrator/wrappers";
import { credentials, getCtx } from "./credentials.svelte";
import { PersistentStore } from "./store.svelte";

type CacheData = {
  dashboard?: SchoolboxDashboard;
  timetable?: SchoolboxTimetableEvent[];
  // key represents the numeric id of the homepage
  homepages?: Record<string, SchoolboxHomepage>;
};

class Cache extends PersistentStore<CacheData> {
  userId: CacheItem<number>;
  homepage: CacheItem<SchoolboxHomepage>;
  dashboard: CacheItem<SchoolboxDashboard>;
  timetable: CacheItem<SchoolboxTimetableEvent[]>;
  classes: CacheItem<SchoolboxClass[]>;

  constructor() {
    super("cache.json", {});
    this.userId = new CacheItem<number>(this, "userId", async () => {
      const result = await registerMobile(getCtx());
      return result.id;
    });
    this.homepage = new CacheItem<SchoolboxHomepage>(
      this,
      (id: string) => `homepage-${id}`,
      (id: string) => getHomepage(getCtx(), `/homepage/${id}`),
    );
    this.dashboard = new CacheItem<SchoolboxDashboard>(this, "dashboard", () => getDashboard(getCtx()));
    this.timetable = new CacheItem<SchoolboxTimetableEvent[]>(this, "timetable", () => getTimetable(getCtx()));
    this.classes = new CacheItem<SchoolboxClass[]>(this, "classes", () => getClasses(getCtx()));
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
