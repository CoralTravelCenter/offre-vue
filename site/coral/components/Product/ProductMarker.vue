<script setup>
import {computed, getCurrentInstance, inject, ref, toRef} from "vue";

import icon_default from 'data-url:/site/coral/assets-inline/hotel-marker-default.svg';
import icon_cfc from 'data-url:/site/coral/assets-inline/hotel-marker-cfc.svg';
import icon_elite from 'data-url:/site/coral/assets-inline/hotel-marker-elite.svg';
import {useProductOffer} from "../../composables/useProductOffer";

import {openedMapMarker} from "./global-state";
const $this = getCurrentInstance();

const props = defineProps({
  product: Object,
  initiallyOpen: {
    type: Boolean,
    default: false
  }
});

const widgetOptions = inject('widget-options');
const widgetHotelsList = inject('widget-hotels-list');
const sharedTourTypeByHotelId = inject('shared-tour-type-by-hotel-id', null);
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
  <div class="marker" :class="{ open: isOpen }">
    <button class="placemark" type="button" :style="{ backgroundImage: `url(${ placemarkIconUrl })` }" @click.stop="handleClick"></button>
  </div>
</template>

<style scoped lang="less">
@import "../../common/css/layout";
@import "../../common/css/coral-colors";

.marker {
  font-size: 14px;
  line-height: 1;
  position: relative;
  width: 2em;
  height: (43/33) * 2em;
  transform: translate(-50%, -100%);

  .placemark {
    position: absolute;
    padding: 0;
    border: 0;
    background-color: transparent;
    cursor: pointer;
    inset: 0;
    background: center / cover no-repeat;
  }

}
</style>
