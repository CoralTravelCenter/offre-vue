<script setup>
import { Primitive } from "reka-ui";
import { cn } from "app/lib/utils";

const props = defineProps({
  class: {
    type: [Boolean, null, String, Object, Array],
    required: false,
    skipCheck: true,
  },
  asChild: { type: Boolean, required: false },
  as: { type: null, required: false, default: "p" },
});
</script>

<template>
  <Primitive
    data-slot="card-description"
    :as="as"
    :as-child="asChild"
    :class="cn('text-muted-foreground text-sm', props.class)"
  >
    <slot />
  </Primitive>
</template>
