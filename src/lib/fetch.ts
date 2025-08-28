import { fetch } from "@tauri-apps/plugin-http";
import { store } from "./store.svelte";

export async function fetcher(pathname: string, params?: URLSearchParams): Promise<Response> {
  return fetch(`${store.state.auth.url}${pathname}${params ? `?${params.toString()}` : ""}`, {
    headers: {
      Authorization: `Bearer ${store.state.auth.jwt}`,
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  });
}

export async function scraper<T>(pathname: string, scraper: (document: Document) => T): Promise<T> {
  const response = await fetch(`${store.state.auth.url}${pathname}`, {
    headers: {
      Authorization: `Bearer ${store.state.auth.jwt}`,
    },
  });
  const html = await response.text();
  const document = new DOMParser().parseFromString(html, "text/html");
  return scraper(document);
}
