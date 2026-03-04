<script setup>
import {computed, inject, ref, toRef} from "vue";
import {useElementVisibility, whenever} from "@vueuse/core";
import {trackAnyProductCardVisible} from "./global-state";
import {useProductOffer} from "../../composables/useProductOffer";
import {Card, CardContent, CardFooter} from "app/components/ui/card";
import ProductCardVisual from "./ProductCardVisual.vue";
import ProductCardDetails from "./ProductCardDetails.vue";
import ProductCardPricing from "./ProductCardPricing.vue";

const props = defineProps(['product']);

const widgetOptions = inject('widget-options');
const widgetHotelsList = inject('widget-hotels-list');
const sharedTourTypeByHotelId = inject('shared-tour-type-by-hotel-id', null);
const {calcCashbackFn} = inject('calc-cashback');

const {
  hotel,
  tourType,
  fetchingHotelOffer,
  offer,
  offerFinalPrice,
  offerFinalPriceFormatted,
  offerListPriceFormatted,
  isHotelOnly,
  offerHref,
  beginDate
} = useProductOffer({
  product: toRef(props, 'product'),
  widgetOptions,
  widgetHotelsList,
  sharedTourTypeByHotelId,
  priceLabelMode: 'detailed'
});

const $el = ref();

const selectedDeparture = inject('selected-departure');
const {getReferenceValueByKey} = inject('product-reference');

const hotelCategory = computed(() => getReferenceValueByKey('hotelCategories', hotel.categoryKey) || {});
const hotelCategoryName = computed(() => hotelCategory.value.name || '');
const hotelStarCount = computed(() => hotelCategory.value.starCount || 0);
const mealType = computed(() => {
  const mealKey = offer.value?.rooms?.[0]?.mealKey;
  return getReferenceValueByKey('meals', mealKey)?.name || '';
});

const cashbackInfo = computed(() => {
  return calcCashbackFn.value({
    id: hotel.id,
    night: offer.value?.stayNights,
    star: hotelStarCount.value,
    price: offerFinalPrice.value,
    checkInDate: offer.value?.checkInDate,
    countryID: hotel.countryKey,
    isOnlyHotel: isHotelOnly.value || tourType.value === 'hotel'
  });
});

const gridViewMode = inject('grid-view-mode');

const hotelUspsList = computed(() => {
  const matchedHotelSetup = widgetHotelsList.find((hotelSetup) => {
    const setupId = typeof hotelSetup === 'number' ? hotelSetup : hotelSetup?.id;
    return setupId == hotel.id;
  });

  return Array.isArray(matchedHotelSetup?.usps) ? matchedHotelSetup.usps : [];
});

const clickedLocationHotelId = inject('clicked-location-hotel-id');

function handleHotelLocationClick(nextHotel) {
  if (nextHotel.coordinates) {
    clickedLocationHotelId.value = nextHotel.id;
    gridViewMode.value = 'map';
  }
}

const isProductCardVisible = useElementVisibility($el);
whenever(isProductCardVisible, () => {
  trackAnyProductCardVisible();
});

</script>

<template>
  <Card ref="$el" class="product-card flex flex-col rounded-[20px] border border-[rgba(0,0,0,0.15)] bg-white p-2"
  >
    <CardContent class="product-card__content p-0">
      <ProductCardVisual :hotel="hotel" :offer-href="offerHref"/>
      <ProductCardDetails
          :hotel="hotel"
          :offer="offer"
          :offer-href="offerHref"
          :begin-date="beginDate"
          :selected-departure-name="selectedDeparture?.name"
          :hotel-category-name="hotelCategoryName"
          :hotel-star-count="hotelStarCount"
          :meal-type="mealType"
          :hotel-usps-list="hotelUspsList"
          @location-click="handleHotelLocationClick"
      />
    </CardContent>

    <CardFooter class="product-card__footer p-0 block">
      <ProductCardPricing
          v-model:tour-type="tourType"
          :is-hotel-only="isHotelOnly"
          :fetching-hotel-offer="fetchingHotelOffer"
          :offer="offer"
          :offer-list-price-formatted="offerListPriceFormatted"
          :offer-final-price-formatted="offerFinalPriceFormatted"
          :cashback-info="cashbackInfo"
          :offer-href="offerHref"
      />
    </CardFooter>
  </Card>
</template>

<style scoped lang="less">
.product-card {
  min-width: 0;
}

.product-card__content,
.product-card__footer {
  min-width: 0;
}

@media screen and (min-width: 1280px) {
  .product-card {
    display: grid;
    grid-template-columns: 300px minmax(0, 1fr) 300px;
    align-items: stretch;
    gap: 16px;
  }

  .product-card__content {
    grid-column: 1 / 3;
    display: grid;
    grid-template-columns: 300px minmax(0, 1fr);
    gap: 16px;
    align-items: stretch;
  }

  .product-card__footer {
    grid-column: 3;
    grid-row: 1;
    display: block;
  }
}
</style>
