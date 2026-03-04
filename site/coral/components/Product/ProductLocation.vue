<script setup>
import locationPlacemarkIcon from 'data-url:/site/coral/assets-inline/location-placemark.svg';

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
      :class="[
        'product-location inline-flex items-center leading-[1.3]',
        variant === 'card'
          ? 'product-location--card mb-1 self-start py-1 text-[12px] font-light'
          : 'product-location--marker text-[14px] text-black/60 max-[768px]:text-[12px]',
        clickable && hasCoordinates ? 'product-location--clickable cursor-pointer' : ''
      ]"
      @click="handleClick"
  >
    <img
      :class="[
        'product-location__icon shrink-0 object-contain',
        variant === 'card' ? 'mb-[2px] mr-1 h-[14px] w-[12px]' : 'mr-2 h-[16px] w-[13px]'
      ]"
      :src="locationPlacemarkIcon"
      alt=""
      aria-hidden="true"
    >
    {{ value }}
  </div>
</template>
