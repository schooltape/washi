<script>
  import { onNavigate } from "$app/navigation";
  import "../app.css";

  let { children } = $props();

  onNavigate((navigation) => {
    if (!document.startViewTransition) return;

    return new Promise((resolve) => {
      document.startViewTransition(async () => {
        resolve();
        await navigation.complete;
      });
    });
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
