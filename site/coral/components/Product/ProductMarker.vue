<script setup>
import {computed, getCurrentInstance, inject, ref} from "vue";

import icon_default from 'data-url:/site/coral/assets-inline/hotel-marker-default.svg';
import icon_cfc from 'data-url:/site/coral/assets-inline/hotel-marker-cfc.svg';
import icon_elite from 'data-url:/site/coral/assets-inline/hotel-marker-elite.svg';
import {useProductOffer} from "../../composables/useProductOffer";

import {openedMapMarker} from "./global-state";
import ProductMarkerVisual from "./ProductMarkerVisual.vue";
import ProductMarkerDetails from "./ProductMarkerDetails.vue";
import ProductMarkerPricing from "./ProductMarkerPricing.vue";

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
const {
  hotel,
  tourType,
  fetchingHotelOffer,
  offer,
  offerFinalPriceFormatted,
  offerListPriceFormatted,
  isHotelOnly,
  offerHref,
  beginDate
} = useProductOffer({
  product: props.product,
  widgetOptions,
  widgetHotelsList,
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

const selectedDeparture = inject('selected-departure');
const {getReferenceValueByKey} = inject('product-reference');

const {name: hotelCategoryName, starCount: hotelStarCount} = getReferenceValueByKey('hotelCategories', hotel.categoryKey);
const {name: mealType} = getReferenceValueByKey('meals', offer.value.rooms[0].mealKey)

function handleClick() {
  isOpen.value = !isOpen.value;
  openedMapMarker.value = isOpen.value ? $this : null;
}

</script>

<template>
  <div class="marker" :class="{ open: isOpen }" @click="handleClick">
    <div class="placemark" :style="{ backgroundImage: `url(${ placemarkIconUrl })` }"></div>

    <div class="popover">
      <ProductMarkerVisual :hotel="hotel" :is-open="isOpen"/>

      <div class="info-pricing">
        <ProductMarkerDetails
            :hotel="hotel"
            :offer="offer"
            :selected-departure-name="selectedDeparture?.name"
            :begin-date="beginDate"
            :hotel-category-name="hotelCategoryName"
            :hotel-star-count="hotelStarCount"
            :meal-type="mealType"
            :is-open="isOpen"
        />

        <ProductMarkerPricing
            v-model:tour-type="tourType"
            :is-hotel-only="isHotelOnly"
            :fetching-hotel-offer="fetchingHotelOffer"
            :offer="offer"
            :offer-list-price-formatted="offerListPriceFormatted"
            :offer-final-price-formatted="offerFinalPriceFormatted"
            :offer-href="offerHref"
            :is-open="isOpen"
        />
      </div>
    </div>
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
    inset: 0;
    background: center / cover no-repeat;
  }

  &.open {
    .popover {
      padding: 0 1em 0 0;
      border-radius: .5em;
      box-shadow: 2px -2px 16px fade(black, 20%);

      .info-pricing {
        padding: 1em 0;
      }
    }
  }

  &:not(.open) {
    .popover {
      gap: 0;

      .info-pricing {
        padding: 0;
        gap: 0;
      }
    }
  }

  .popover {
    position: absolute;
    z-index: -1;
    line-height: 1.5;
    padding: 0 .5em 0 2.2em;
    border-radius: 100px;
    left: 2px;
    top: auto;
    bottom: 1em;
    max-width: unset;
    box-shadow: 1px 1px 2px fade(black, 25%);
    background: fade(white, 90%);
    backdrop-filter: blur(4px);
    display: flex;
    gap: 1em;
    overflow: hidden;
    .transit(box-shadow, .25s);

    .info-pricing {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
  }
}
</style>
