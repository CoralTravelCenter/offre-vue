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
  as: { type: null, required: false, default: "h3" },
});
</script>

<template>
  <Primitive
    data-slot="card-title"
    :as="as"
    :as-child="asChild"
    :class="cn('leading-none font-semibold', props.class)"
  >
    <slot />
  </Primitive>
</template>
