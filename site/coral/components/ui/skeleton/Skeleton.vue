<script setup>
import {cn} from "app/lib/utils";

const props = defineProps({
  class: {
    type: [Boolean, null, String, Object, Array],
    required: false,
    skipCheck: true
  }
});
</script>

<template>
  <div data-slot="skeleton" :class="cn('animate-pulse rounded-md bg-[#E5E7EB]', props.class)"></div>
</template>
