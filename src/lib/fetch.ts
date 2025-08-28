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

export async function wrapper(func: any, params: any) {
  return func(fetcher, ...params);
}

export async function scraper<T>(pathname: string, scraper: (html: string) => T): Promise<T> {
  const response = await fetch(pathname, {
    headers: {
      Authorization: `Bearer ${store.get("schoolboxJwt")}`,
    },
  });
  const html = await response.text();
  return scraper(html);
}
