<script setup>
import {computed, getCurrentInstance, ref, toRef} from "vue";

import icon_default from 'data-url:/site/coral/assets-inline/hotel-marker-default.svg';
import icon_cfc from 'data-url:/site/coral/assets-inline/hotel-marker-cfc.svg';
import icon_elite from 'data-url:/site/coral/assets-inline/hotel-marker-elite.svg';
import {useProductOffer} from "../../composables/useProductOffer";
import {useProductContext} from "../../composables/useProductContext";

import {openedMapMarker} from "./global-state";
const $this = getCurrentInstance();

const props = defineProps({
  product: Object,
  initiallyOpen: {
    type: Boolean,
    default: false
  }
});

const {widgetOptions, widgetHotelsList, sharedTourTypeByHotelId} = useProductContext();
const {hotel} = useProductOffer({
  product: toRef(props, 'product'),
  widgetOptions,
  widgetHotelsList,
  sharedTourTypeByHotelId,
  priceLabelMode: 'compact'
});

const placemarkIconUrl = computed(() => {
  if (hotel.sunFamilyClub || hotel.coralFamilyClub) {
    return icon_cfc;
  }
  if (hotel.eliteHotel) {
    return icon_elite;
  }
  return icon_default;
});

const isOpen = ref(props.initiallyOpen);
defineExpose({hide: () => isOpen.value = false});

const emit = defineEmits(['toggle']);

function handleClick() {
  isOpen.value = !isOpen.value;
  openedMapMarker.value = isOpen.value ? $this : null;
  emit('toggle', isOpen.value ? hotel.id : null);
}

</script>

<template>
  <div
    :class="[
      'product-marker marker relative h-[37px] w-7 -translate-x-1/2 -translate-y-full text-[14px] leading-none',
      isOpen ? 'product-marker--open open' : ''
    ]"
  >
    <button
      class="product-marker__placemark placemark absolute inset-0 cursor-pointer border-0 bg-transparent bg-cover bg-center bg-no-repeat p-0"
      type="button"
      :style="{ backgroundImage: `url(${ placemarkIconUrl })` }"
      @click.stop="handleClick"
    ></button>
  </div>
</template>
