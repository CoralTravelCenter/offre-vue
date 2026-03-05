<script setup>
import { reactiveOmit } from "@vueuse/core";
import { ToggleGroupItem, useForwardProps } from "reka-ui";
import { cn } from "app/lib/utils";
import { toggleVariants } from 'app/components/ui/toggle';

const props = defineProps({
  value: { type: null, required: true },
  disabled: { type: Boolean, required: false },
  asChild: { type: Boolean, required: false },
  as: { type: null, required: false },
  class: {
    type: [Boolean, null, String, Object, Array],
    required: false,
    skipCheck: true,
  },
  variant: { type: null, required: false },
  size: { type: null, required: false },
  spacing: { type: Number, required: false, default: 0 },
});

const delegatedProps = reactiveOmit(props, "class", "size", "variant", "spacing");
const forwardedProps = useForwardProps(delegatedProps);
</script>

<template>
  <ToggleGroupItem
    v-slot="slotProps"
    data-slot="toggle-group-item"
    :data-variant="variant"
    :data-size="size"
    :data-spacing="spacing"
    v-bind="forwardedProps"
    :class="
      cn(
        toggleVariants({
          variant,
          size,
        }),
        'w-auto min-w-0 shrink-0 px-3 focus:z-10 focus-visible:z-10',
        'data-[spacing=0]:rounded-none data-[spacing=0]:shadow-none data-[spacing=0]:first:rounded-l-md data-[spacing=0]:last:rounded-r-md data-[spacing=0]:data-[variant=outline]:border-l-0 data-[spacing=0]:data-[variant=outline]:first:border-l',
        props.class,
      )
    "
  >
    <slot v-bind="slotProps" />
  </ToggleGroupItem>
</template>
