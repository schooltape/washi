<script lang="ts">
  import type { Snippet } from "svelte";
  import { Dialog, Separator, type WithoutChild } from "bits-ui";
  import { X } from "@lucide/svelte";
  import { settings } from "$lib/store";

  type Props = Dialog.RootProps & {
    trigger: Snippet;
    title: Snippet;
    description: Snippet;
    triggerProps?: WithoutChild<Dialog.TriggerProps>;
    contentProps?: WithoutChild<Dialog.ContentProps>;
    // ...other component props if you wish to pass them
  };

  let {
    open = $bindable(false),
    children,
    triggerProps,
    contentProps,
    trigger,
    title,
    description,
    ...restProps
  }: Props = $props();
</script>

<Dialog.Root bind:open {...restProps}>
  <Dialog.Trigger {...triggerProps}>
    {@render trigger()}
  </Dialog.Trigger>
  <Dialog.Portal>
    <Dialog.Overlay class="fixed inset-0 z-50 bg-ctp-base/80 backdrop-blur-md" />
    <Dialog.Content
      class="{settings.state.theme
        .flavour} fixed top-[50%] left-[50%] z-50 flex w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] flex-col gap-4 rounded-lg bg-ctp-mantle p-4 text-ctp-text outline-3 outline-ctp-overlay0 sm:max-w-[490px] md:w-full"
      {...contentProps}>
      <Dialog.Title class="flex w-full items-center justify-center text-lg font-semibold tracking-tight">
        {@render title()}
      </Dialog.Title>
      <Separator.Root class="-mx-4 block h-px bg-ctp-surface0" />

      <Dialog.Description>
        {@render description()}
      </Dialog.Description>
      {@render children?.()}
      <Dialog.Close class="absolute top-5 right-5 rounded-md transition-transform duration-300 active:scale-[0.9]">
        <X class="size-5 stroke-ctp-text" />
        <span class="sr-only">Close</span>
      </Dialog.Close>
    </Dialog.Content>
  </Dialog.Portal>
</Dialog.Root>
