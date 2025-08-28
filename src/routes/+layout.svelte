<script>
  import { onMount } from "svelte";
  let { children } = $props();
  import "../app.css";
  import { store } from "$lib/store.svelte";

  onMount(async () => {
    await store.sync();
  });
</script>

<div class="flex h-screen flex-col">
  <nav class="h-12 bg-ctp-mantle">
    <a href="/auth">Auth</a>
    <a href="/timetable">Timetable</a>
    <a href="/debugging">Debugging</a>
    <a href="/settings">Settings</a>
  </nav>

  <div class="flex-grow">
    {@render children()}
  </div>
</div>
