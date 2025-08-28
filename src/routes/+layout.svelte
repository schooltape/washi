<script>
  let { children } = $props();
  import "../app.css";
</script>

<div class="flex h-screen flex-col">
  <nav class="h-12 bg-ctp-mantle">
    <a href="/auth">Auth</a>
    <a href="/timetable">Timetable</a>
    <a href="/debugging">Debugging</a>
  </nav>

  <div class="flex-grow">
    {@render children()}
  </div>
</div>
