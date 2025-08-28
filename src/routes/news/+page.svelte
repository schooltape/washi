<script lang="ts">
  import { invoke } from "@tauri-apps/api/core";
  import { onMount } from "svelte";
  import { fetch } from "@tauri-apps/plugin-http";
  import { store } from "../../lib/store";

  let newsFeed = $state([]);

  onMount(() => {
    fetchNews();
  });

  async function fetchNews() {
    console.log("hello");
    const schoolboxUrl = await store.get("schoolboxUrl");
    const schoolboxJwt = await store.get("jwt");

    const response = await fetch(`${schoolboxUrl}/news/lists/feed`, {
      method: "GET",
      headers: [
        ["Content-Type", "application/json"],
        ["Accept", "application/json"],
        ["Authorization", `Bearer ${schoolboxJwt}`],
      ],
    });

    console.log(response.status); // e.g. 200
    console.log(response.statusText); // e.g. "OK"
    const data =
      (await response.json()) as operations["commsNews.getListForIndex"]["responses"]["200"]["content"]["application/json"];
    console.log(data);

    newsFeed = data;
  }
</script>

<main>
  <h1>News</h1>

  <button onclick={fetchNews}>Fetch News</button>

  {#if newsFeed}
    <div class="flex flex-col gap-4">
      {#each newsFeed as newsItem}
        <div class="flex min-h-4 w-full bg-ctp-mantle">
          <div>
            <img
              class="h-32 w-32 object-cover"
              src="https://SCHOOLBOX_URL{newsItem.featureImage?._links?.image?.href}"
              alt="" />
          </div>

          <div>
            <a
              href="https://SCHOOLBOX_URL{typeof newsItem._links?.self === 'string'
                ? newsItem._links.self
                : newsItem._links?.self?.href}"
              class="text-lg text-ctp-pink">{newsItem.title}</a>
            <p class="line-clamp-3 text-ctp-subtext0">
              {newsItem.blurb}
            </p>
          </div>
        </div>
      {/each}
    </div>
  {:else}
    <p>No news available.</p>
  {/if}
</main>
