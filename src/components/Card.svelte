<script lang="ts">
  let { title, icon, children } = $props();
</script>

<div class="flex max-w-lg flex-col gap-4 rounded-lg border-1 border-ctp-surface0 bg-ctp-mantle p-4">
  <h2 class="flex items-center gap-2 text-ctp-text">{@render icon()} {title}</h2>
  {@render children()}
</div>
