<script setup>
import {computed, toRef} from "vue";
import {Card, CardContent} from "app/components/ui/card";
import {useProductOffer} from "../../composables/useProductOffer";
import {useProductContext} from "../../composables/useProductContext";
import ProductCardVisual from "./ProductCardVisual.vue";
import ProductLocation from "./ProductLocation.vue";
import ProductRatingStars from "./ProductRatingStars.vue";
import ProductPriceBlock from "./ProductPriceBlock.vue";
import ProductHotelName from "./ProductHotelName.vue";
import ProductTourTypeSwitch from "./ProductTourTypeSwitch.vue";

const props = defineProps({
  product: {
    type: Object,
    required: true
  }
});

const {
  widgetOptions,
  widgetHotelsList,
  sharedTourTypeByHotelId,
  selectedDeparture,
  productReference
} = useProductContext();
const {getReferenceValueByKey} = productReference;

const {
  hotel,
  tourType,
  offer,
  offerFinalPriceFormatted,
  offerListPriceFormatted,
  isHotelOnly,
  offerHref
} = useProductOffer({
  product: toRef(props, 'product'),
  widgetOptions,
  widgetHotelsList,
  sharedTourTypeByHotelId,
  priceLabelMode: 'detailed'
});

const hotelCategory = computed(() => getReferenceValueByKey('hotelCategories', hotel.categoryKey) || {});
const hotelStarCount = computed(() => hotelCategory.value.starCount || 0);
</script>

<template>
  <Card class="map-overlay-card mb-2 w-[calc(100%-16px)] min-w-0 rounded-[20px] border border-border bg-white p-2 shadow-[0_14px_40px_rgba(0,0,0,0.18)]">
    <CardContent class="map-overlay-card__content grid min-w-0 grid-cols-[104px_minmax(0,1fr)] items-stretch gap-3 p-0 max-[768px]:grid-cols-[92px_minmax(0,1fr)] max-[768px]:gap-[10px]">
      <div class="map-overlay-card__visual-wrap min-w-0">
        <ProductCardVisual
          class="map-overlay-card__visual h-full min-w-0 [&_.product-card-visual__image]:!h-full [&_.product-card-visual__image]:!min-h-[160px] max-[768px]:[&_.product-card-visual__image]:!min-h-[144px] [&_.product-card-visual__badges]:hidden"
          :hotel="hotel"
          :offer-href="offerHref"
        />
      </div>

      <div class="map-overlay-card__main flex min-w-0 flex-col justify-between gap-2">
        <ProductTourTypeSwitch
            class="map-overlay-card__toggle w-full"
            v-model="tourType"
            :is-hotel-only="isHotelOnly"
        />

        <div class="map-overlay-card__hotel-head min-w-0">
          <ProductLocation class="map-overlay-card__location mb-[2px]" :value="hotel.locationSummary" variant="card"/>
          <ProductHotelName
              :offer-href="offerHref"
              :name="hotel.name"
              link-class="map-overlay-card__hotel-link text-inherit no-underline hover:underline"
              title-class="map-overlay-card__name m-0 break-words text-[16px] font-bold leading-[1.15] max-[768px]:text-[14px]"
          />
        </div>

        <ProductRatingStars
          v-if="hotelStarCount"
          class="map-overlay-card__rating [&_.product-rating__star]:h-[18px] [&_.product-rating__star]:w-[18px] max-[768px]:[&_.product-rating__star]:h-4 max-[768px]:[&_.product-rating__star]:w-4"
          :count="hotelStarCount"
          variant="card"
        />

        <ProductPriceBlock
          class="map-overlay-card__price-block [&_.product-price-block__from]:text-[12px] [&_.product-price-block__old]:text-[14px] [&_.product-price-block__final]:text-[42px] max-[768px]:[&_.product-price-block__from]:text-[10px] max-[768px]:[&_.product-price-block__old]:text-[12px] max-[768px]:[&_.product-price-block__final]:text-[24px]"
          :from-label="selectedDeparture?.name ? `цена от: из ${$cityGenitiveCase(selectedDeparture.name)}` : 'цена от:'"
          :old-price="offer.price.oldAmount ? offerListPriceFormatted : ''"
          :final-price="offerFinalPriceFormatted"
          variant="card"
        />
      </div>
    </CardContent>
  </Card>
</template>
