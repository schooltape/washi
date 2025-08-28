<script lang="ts">
  interface Props {
    id: string;
    placeholder: string;
    value: string;
    onclick?: (event: Event) => void;
    label?: string;
    submitButton?: boolean;
    required?: boolean;
  }

  let {
    id,
    placeholder,
    value = $bindable(),
    onclick,
    label = "Submit",
    submitButton = true,
    required = true,
  }: Props = $props();
</script>

<div class="flex w-full items-center justify-center overflow-clip rounded-md border-1 border-ctp-surface0">
  <input {id} class="w-full bg-ctp-base p-2 text-ctp-text" bind:value {placeholder} type="text" {required} />
  {#if submitButton}
    <button class="bg-ctp-pink p-2 text-ctp-base" type="submit" {onclick}>{label}</button>
  {/if}
</div>
