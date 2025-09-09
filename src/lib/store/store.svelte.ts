import { LazyStore } from "@tauri-apps/plugin-store";

export abstract class PersistentStore<T extends Record<string, unknown>> {
  protected defaults: T;
  state: T;
  protected store: LazyStore;
  initialised: boolean = $state(false); // TODO)) put this in the main state?

  constructor(filename: string, defaults: T) {
    this.defaults = defaults;
    this.state = $state(this.defaults);
    this.store = new LazyStore(filename, { defaults: this.defaults });
    // this.store.onChange(() => this.sync());

    $effect.root(() => {
      $effect(() => {
        console.log("effect go brr", $state.snapshot(this.state));
        // console.log("in effect:", $effect.tracking()); // true
        if (this.state && this.initialised === true) {
          for (const [key, value] of Object.entries(this.state)) {
            console.log(`Setting ${key} to ${value}`);
            this.store.set(key, value);
          }
        }
      });
    });
  }

  async sync() {
    this.initialised = true;
    Object.assign(this.state, Object.fromEntries(await this.store.entries()));
  }

  async reset() {
    await this.store.reset();
  }
}
