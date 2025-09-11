<script lang="ts">
  let { title, icon = null, children, headerActions, footer, contentProps } = $props();
</script>

<div class="flex flex-col gap-4 rounded-lg border-1 border-ctp-surface0 bg-ctp-mantle p-4">
  <!-- header -->
  <div class="flex h-10 items-center justify-between">
    <div class="flex items-center gap-2">
      {@render icon?.()}
      <h2>{title}</h2>
    </div>
    {@render headerActions?.()}
  </div>

  <div class="flex-grow" {...contentProps}>
    {@render children()}
  </div>

  {@render footer?.()}
</div>
