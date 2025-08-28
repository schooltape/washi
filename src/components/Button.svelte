<script lang="ts">
  import { Button } from "bits-ui";
  let { children, ...props } = $props();
</script>

<Button.Root
  class="inline-flex items-center gap-2 rounded-md border-1 border-ctp-surface0 bg-ctp-base p-2 transition-all duration-300 hover:bg-ctp-base/60 active:scale-[0.98]"
  {...props}>
  {@render children()}
</Button.Root>
