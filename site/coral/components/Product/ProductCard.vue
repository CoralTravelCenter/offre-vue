<script setup>
import {computed, ref, toRef} from "vue";
import {useElementVisibility, whenever} from "@vueuse/core";
import {trackAnyProductCardVisible} from "./global-state";
import {useProductOffer} from "../../composables/useProductOffer";
import {useProductContext} from "../../composables/useProductContext";
import {Card, CardContent, CardFooter} from "app/components/ui/card";
import ProductCardVisual from "./ProductCardVisual.vue";
import ProductCardDetails from "./ProductCardDetails.vue";
import ProductCardPricing from "./ProductCardPricing.vue";

const props = defineProps(['product']);

const {
  widgetOptions,
  widgetHotelsList,
  sharedTourTypeByHotelId,
  calcCashback,
  selectedDeparture,
  productReference,
  gridViewMode,
  clickedLocationHotelId
} = useProductContext();
const {calcCashbackFn} = calcCashback;

const {
  hotel,
  tourType,
  offerRequestState,
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
const {getReferenceValueByKey} = productReference;

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

const hotelUspsList = computed(() => {
  const matchedHotelSetup = widgetHotelsList.find((hotelSetup) => {
    const setupId = typeof hotelSetup === 'number' ? hotelSetup : hotelSetup?.id;
    return setupId == hotel.id;
  });

  return Array.isArray(matchedHotelSetup?.usps) ? matchedHotelSetup.usps : [];
});
const isEliteHotel = computed(() => Boolean(hotel.eliteHotel));
const productCardStyle = computed(() => {
  if (!isEliteHotel.value) {
    return undefined;
  }

  return {
    '--primary': '#B6985B',
    '--color-primary': 'var(--primary)',
    '--product-card-font-family': '"Trajan Pro 3", serif'
  };
});

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
  <Card
      ref="$el"
      class="product-card flex min-w-0 flex-col rounded-[20px] border border-border bg-white p-2 min-[1280px]:grid min-[1280px]:grid-cols-[300px_minmax(0,1fr)_300px] min-[1280px]:items-stretch min-[1280px]:gap-4"
      :style="productCardStyle"
  >
    <CardContent
        class="product-card__content min-w-0 p-0 min-[1280px]:col-span-2 min-[1280px]:grid min-[1280px]:grid-cols-[300px_minmax(0,1fr)] min-[1280px]:items-stretch min-[1280px]:gap-4">
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
          :is-elite-hotel="isEliteHotel"
          @location-click="handleHotelLocationClick"
      />
    </CardContent>

    <CardFooter
        class="product-card__footer block min-w-0 p-0 min-[1280px]:h-full min-[1280px]:col-start-3 min-[1280px]:row-start-1 mt-auto">
      <ProductCardPricing
          v-model:tour-type="tourType"
          :is-hotel-only="isHotelOnly"
          :is-elite-hotel="isEliteHotel"
          :offer-request-state="offerRequestState"
          :offer="offer"
          :offer-list-price-formatted="offerListPriceFormatted"
          :offer-final-price-formatted="offerFinalPriceFormatted"
          :cashback-info="cashbackInfo"
          :offer-href="offerHref"
      />
    </CardFooter>
  </Card>
</template>
