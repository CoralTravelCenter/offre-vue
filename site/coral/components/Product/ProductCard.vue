<script setup>
import {computed, inject, ref} from "vue";
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
  product: props.product,
  widgetOptions,
  widgetHotelsList,
  priceLabelMode: 'detailed'
});

const $el = ref();

const selectedDeparture = inject('selected-departure');
const {getReferenceValueByKey} = inject('product-reference');

const {
  name: hotelCategoryName,
  starCount: hotelStarCount
} = getReferenceValueByKey('hotelCategories', hotel.categoryKey);
const {name: mealType} = getReferenceValueByKey('meals', offer.value.rooms[0].mealKey)

const cashbackInfo = computed(() => {
  return calcCashbackFn.value({
    id: hotel.id,
    night: offer.value.stayNights,
    star: hotelStarCount,
    price: offerFinalPrice.value,
    checkInDate: offer.value.checkInDate,
    countryID: hotel.countryKey,
    isOnlyHotel: isHotelOnly || tourType.value === 'hotel'
  });
});

const gridViewMode = inject('grid-view-mode');

const hotelUspsList = computed(() => {
  return widgetHotelsList.find(hotelSetup => hotelSetup.id === hotel.id)?.usps;
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
  <Card ref="$el" class="flex flex-col rounded-[20px] border border-[rgba(0,0,0,0.15)] bg-white p-2"
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
