<script lang="ts">
  import Card from "$components/Card.svelte";
  import Timetable from "$widgets/Timetable.svelte";
  import { Clock } from "@lucide/svelte";
</script>

<Card title="Timetable">
  {#snippet icon()}
    <Clock class="stroke-(--ctp-accent)" />
  {/snippet}

  <Timetable />
</Card>
