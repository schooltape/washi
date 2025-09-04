<script lang="ts">
  import type { IconProps } from "@lucide/svelte";
  import type { Snippet } from "svelte";

  interface Props {
    id: string;
    placeholder: string;
    value: string;
    onclick?: (event: Event) => void;
    label?: string;
    submitButton?: boolean;
    required?: boolean;
    icon?: Snippet<[IconProps]>;
  }

  let {
    id,
    placeholder,
    value = $bindable(),
    onclick,
    label = "Submit",
    submitButton = true,
    required = true,
    icon,
  }: Props = $props();
</script>

<div class="flex w-full items-center justify-center rounded-md border-1 border-ctp-surface0">
  <input
    {id}
    class="min-w-0 flex-grow p-2 placeholder-ctp-overlay1 {submitButton ? 'rounded-l-md' : 'rounded-md'}"
    bind:value
    {placeholder}
    type="text"
    {required} />
  {#if icon}
    {@render icon({ class: "size-9 px-2 text-ctp-overlay1" })}
  {/if}
  {#if submitButton}
    <button class="rounded-r-md bg-ctp-pink p-2 text-ctp-base" type="submit" {onclick}>{label}</button>
  {/if}
</div>
