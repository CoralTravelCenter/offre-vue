<script setup>
defineProps({
  hotel: {
    type: Object,
    required: true
  },
  isOpen: {
    type: Boolean,
    default: false
  }
});
</script>

<template>
  <div class="visual" :class="{ open: isOpen }"
       :style="{ backgroundImage: `url(${ hotel.images[0].sizes.find(s => s.type === 4).url })` }"></div>
</template>

<style scoped lang="less">
@import "../../common/css/layout";

.visual {
  .proportional(1/1);
  background: center / cover no-repeat;
  width: 9em;
  flex-shrink: 0;

  &:not(.open) {
    font-size: 0;
  }
}
</style>
