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
  as: { type: null, required: false, default: "div" },
});
</script>

<template>
  <Primitive
    data-slot="card-content"
    :as="as"
    :as-child="asChild"
    :class="cn('px-6', props.class)"
  >
    <slot />
  </Primitive>
</template>
