// Tauri doesn't have a Node.js server to do proper SSR
// so we will use adapter-static to prerender the app (SSG)
// See: https://v2.tauri.app/start/frontend/sveltekit/ for more info
export const prerender = true;
export const ssr = false;

import { cache, credentials, settings } from "$lib/store";
import { redirect } from "@sveltejs/kit";
import type { LayoutLoad } from "./$types";

export const load: LayoutLoad = async ({ url }) => {
  await cache.sync();
  await credentials.sync();
  await settings.sync();

  const isSignedIn = !!credentials.state.auth;

  if (!isSignedIn && url.pathname !== "/auth") {
    throw redirect(302, "/auth");
  }

  return {
    title: "Washi",
  };
};
