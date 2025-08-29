import { fetch } from "@tauri-apps/plugin-http";
import { store } from "./store.svelte";

export async function fetcher(pathname: string, params?: URLSearchParams): Promise<Response> {
  const url = `${store.state.auth?.url}${pathname}${params ? `?${params.toString()}` : ""}`;
  console.log(`Fetching ${url}`);
  return fetch(url, {
    headers: {
      Authorization: `Bearer ${store.state.auth?.jwt}`,
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  });
}

export async function scraper<T>(pathname: string, scraper: (document: Document) => T): Promise<T> {
  const url = `${store.state.auth?.url}${pathname}`;
  console.log(`Scraping ${url}`);
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${store.state.auth?.jwt}`,
    },
  });
  const html = await response.text();
  const document = new DOMParser().parseFromString(html, "text/html");
  return scraper(document);
}
