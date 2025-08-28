import { fetch } from "@tauri-apps/plugin-http";
import { store } from "./store";

export async function fetcher(pathname: string, params?: URLSearchParams): Promise<Response> {
  const schoolboxUrl = await store.get("schoolboxUrl");
  const schoolboxJwt = await store.get("schoolboxJwt");

  return fetch(`${schoolboxUrl}${pathname}${params ? `?${params.toString()}` : ""}`, {
    headers: {
      Authorization: `Bearer ${schoolboxJwt}`,
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  });
}

export async function scraper<T>(pathname: string, scraper: (document: Document) => T): Promise<T> {
  const schoolboxUrl = await store.get("schoolboxUrl");
  const schoolboxJwt = await store.get("schoolboxJwt");

  const response = await fetch(`${schoolboxUrl}${pathname}`, {
    headers: {
      Authorization: `Bearer ${schoolboxJwt}`,
    },
  });
  const html = await response.text();
  const document = new DOMParser().parseFromString(html, "text/html");
  return scraper(document);
}
