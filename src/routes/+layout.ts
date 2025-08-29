// Tauri doesn't have a Node.js server to do proper SSR
// so we will use adapter-static to prerender the app (SSG)
// See: https://v2.tauri.app/start/frontend/sveltekit/ for more info
export const prerender = true;
export const ssr = false;

import { store } from "$lib/store.svelte";
import { redirect } from "@sveltejs/kit";
import type { LayoutLoad } from "./$types";

export const load: LayoutLoad = async ({ url }) => {
  await store.sync();

  const isSignedIn = !!store.state.auth;

  if (!isSignedIn && url.pathname !== "/auth") {
    throw redirect(302, "/auth");
  }

  return {};
};
