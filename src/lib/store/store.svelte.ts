import { LazyStore } from "@tauri-apps/plugin-store";

export abstract class PersistentStore<T extends Record<string, unknown>> {
  protected defaults: T;
  state: T;
  store: LazyStore;
  initialised: boolean = $state(false);

  constructor(filename: string, defaults: T) {
    this.defaults = defaults;
    this.state = $state(this.defaults);
    this.store = new LazyStore(filename, { defaults: this.defaults });
    this.store.onChange(() => this.sync());
  }

  async sync() {
    this.initialised = true;
    Object.assign(this.state, Object.fromEntries(await this.store.entries()));
  }
}
