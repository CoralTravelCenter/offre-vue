<script setup>
import {computed, inject, toRef} from "vue";
import {Card, CardContent} from "app/components/ui/card";
import {useProductOffer} from "../../composables/useProductOffer";
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

const widgetOptions = inject('widget-options');
const widgetHotelsList = inject('widget-hotels-list');
const sharedTourTypeByHotelId = inject('shared-tour-type-by-hotel-id', null);
const selectedDeparture = inject('selected-departure');
const {getReferenceValueByKey} = inject('product-reference');

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
  <Card class="map-overlay-card">
    <CardContent class="map-overlay-card__content p-0">
      <div class="map-overlay-card__visual-wrap">
        <ProductCardVisual :hotel="hotel" :offer-href="offerHref"/>
      </div>

      <div class="map-overlay-card__main">
        <ProductTourTypeSwitch
            class="map-overlay-card__toggle"
            v-model="tourType"
            :is-hotel-only="isHotelOnly"
        />

        <div class="map-overlay-card__hotel-head">
          <ProductLocation class="map-overlay-card__location" :value="hotel.locationSummary" variant="card"/>
          <ProductHotelName
              :offer-href="offerHref"
              :name="hotel.name"
              link-class="map-overlay-card__hotel-link"
              title-class="map-overlay-card__name"
          />
        </div>

        <ProductRatingStars v-if="hotelStarCount" :count="hotelStarCount" variant="card"/>

        <ProductPriceBlock
            :from-label="selectedDeparture?.name ? `цена от: из ${$cityGenitiveCase(selectedDeparture.name)}` : 'цена от:'"
            :old-price="offer.price.oldAmount ? offerListPriceFormatted : ''"
            :final-price="offerFinalPriceFormatted"
            variant="card"
        />
      </div>
    </CardContent>
  </Card>
</template>

<style scoped lang="less">
.map-overlay-card {
  width: calc(100% - 16px);
  margin-bottom: 8px;
  border-radius: 20px;
  border: 1px solid rgba(0, 0, 0, 0.15);
  background: #FFFFFF;
  box-shadow: 0 14px 40px rgba(0, 0, 0, 0.18);
  padding: 8px;
}

.map-overlay-card__content {
  display: grid;
  grid-template-columns: 104px minmax(0, 1fr);
  gap: 12px;
  min-width: 0;
  align-items: stretch;
}

.map-overlay-card__visual-wrap {
  min-width: 0;

  :deep(.product-card-visual) {
    height: 100%;
    display: block;
  }

  :deep(.product-card-visual__image) {
    height: 100%;
    min-height: 160px;
  }

  :deep(.badges-grid) {
    display: none;
  }
}

.map-overlay-card__main {
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 8px;
}

.map-overlay-card__toggle {
  width: 100%;
}

.map-overlay-card__hotel-link {
  color: inherit;
  text-decoration: none;
}

.map-overlay-card__hotel-link:hover {
  text-decoration: underline;
}

.map-overlay-card__location {
  margin-bottom: 2px;
}

.map-overlay-card__hotel-head {
  min-width: 0;
}

.map-overlay-card__name {
  margin: 0;
  font-size: 16px;
  line-height: 1.15;
  font-weight: 700;
  word-break: break-word;
}

.map-overlay-card :deep(.product-rating > span) {
  width: 18px;
  height: 18px;
}

.map-overlay-card :deep(.product-price-block__from) {
  font-size: 12px;
}

.map-overlay-card :deep(.product-price-block__old) {
  font-size: 14px;
}

.map-overlay-card :deep(.product-price-block__final) {
  font-size: 42px;
}

@media screen and (max-width: 768px) {
  .map-overlay-card__content {
    grid-template-columns: 92px minmax(0, 1fr);
    gap: 10px;
  }

  .map-overlay-card__visual-wrap :deep(.product-card-visual__image) {
    min-height: 144px;
  }

  .map-overlay-card__name {
    font-size: 14px;
  }

  .map-overlay-card :deep(.product-rating > span) {
    width: 16px;
    height: 16px;
  }

  .map-overlay-card :deep(.product-price-block__from) {
    font-size: 10px;
  }

  .map-overlay-card :deep(.product-price-block__old) {
    font-size: 12px;
  }

  .map-overlay-card :deep(.product-price-block__final) {
    font-size: 24px;
  }
}
</style>
