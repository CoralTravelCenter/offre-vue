<script setup>
const props = defineProps({
  value: {
    type: String,
    default: ''
  },
  clickable: {
    type: Boolean,
    default: false
  },
  hasCoordinates: {
    type: Boolean,
    default: false
  },
  variant: {
    type: String,
    default: 'card'
  }
});

const emit = defineEmits(['click']);

function handleClick() {
  if (!props.clickable || !props.hasCoordinates) {
    return;
  }
  emit('click');
}
</script>

<template>
  <div
      class="product-location"
      :class="[`product-location--${variant}`, { 'product-location--clickable': clickable && hasCoordinates }]"
      @click="handleClick"
  >
    {{ value }}
  </div>
</template>

<style scoped lang="less">
.product-location {
  display: inline-flex;
  align-items: center;
  line-height: 1.3;

  &::before {
    content: '';
    flex-shrink: 0;
    background: url("data-url:/site/coral/assets-inline/location-placemark.svg") center / contain no-repeat;
  }
}

.product-location--clickable {
  cursor: pointer;
}

.product-location--card {
  align-self: flex-start;
  font-size: 12px;
  font-weight: 300;
  padding-block: 4px;
  margin-bottom: 4px;

  &::before {
    width: 12px;
    height: 14px;
    margin-right: 4px;
    margin-bottom: 2px;
  }
}

.product-location--marker {
  color: fade(black, 62%);
  font-size: 14px;

  &::before {
    width: 13px;
    height: 16px;
    margin-right: 8px;
  }
}

@media screen and (max-width: 768px) {
  .product-location--marker {
    font-size: 12px;
  }
}
</style>
