import { PersistentStore } from "./store.svelte";

type CredentialsData = {
  stateVersion: number;
  auth: {
    jwt: string;
    url: string;
  } | null;
  status: {
    type: "synced" | "syncing" | "offline" | "error";
    message?: string;
  };
};

class Credentials extends PersistentStore<CredentialsData> {
  constructor() {
    super("credentials.json", {
      stateVersion: 1,
      auth: null,
      status: { type: "syncing" },
    });
  }
}

export const credentials = new Credentials();
