import { fetch } from "@tauri-apps/plugin-http";
import type { SchoolboxContext } from "serrator/types";
import { PersistentStore } from "./store.svelte";

type CredentialsData = {
  stateVersion: number;
  auth: {
    jwt: string;
    domain: string;
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

export function getCtx(): SchoolboxContext {
  const auth = credentials.state.auth;
  if (!auth || !auth?.domain || !auth?.jwt) {
    throw new Error("credentials are not set");
  }

  return {
    domain: auth.domain,
    jwt: auth.jwt,
    fetch,
    parser: async (res: Response) => {
      const html = await res.text();
      const parser = new DOMParser();
      return parser.parseFromString(html, "text/html");
    },
  };
}
