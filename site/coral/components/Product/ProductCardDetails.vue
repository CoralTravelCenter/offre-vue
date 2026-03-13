<script setup>
import ProductLocation from "./ProductLocation.vue";
import ProductRatingStars from "./ProductRatingStars.vue";
import ProductHotelName from "./ProductHotelName.vue";
import ProductTermItem from "./ProductTermItem.vue";
import cfcBadgeIcon from 'data-url:/site/coral/assets-inline/coral-family-club.svg';

defineProps({
  hotel: {
    type: Object,
    required: true
  },
  offer: {
    type: Object,
    required: true
  },
  offerHref: {
    type: String,
    required: true
  },
  beginDate: {
    type: String,
    required: true
  },
  selectedDepartureName: {
    type: String,
    default: ''
  },
  hotelCategoryName: {
    type: String,
    default: ''
  },
  hotelStarCount: {
    type: Number,
    default: 0
  },
  mealType: {
    type: String,
    default: ''
  },
  isEliteHotel: {
    type: Boolean,
    default: false
  },
  hotelUspsList: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(['location-click']);

function handleLocationClick(hotel) {
  emit('location-click', hotel);
}
</script>

<template>
  <div
      class="product-card-details details flex flex-col justify-start py-2 min-[1280px]:justify-center min-[1280px]:gap-0">
    <ProductLocation
        class="product-card-details__location location min-[1280px]:m-0"
        :value="hotel.locationSummary"
        :clickable="true"
        :has-coordinates="!!hotel.coordinates"
        variant="card"
        @click="handleLocationClick(hotel)"
    />

    <ProductHotelName
        :offer-href="offerHref"
        :name="hotel.name"
        link-class="product-card-details__hotel-link hotel-name mb-1 text-inherit no-underline hover:underline"
        :title-class="[
          'product-card-details__hotel-title name text-[20px] text-black',
          isEliteHotel
            ? 'font-normal [font-family:var(--product-card-font-family)] leading-[1.2] tracking-[0.015em]'
            : 'font-bold'
        ]"
    />

    <div class="product-card-details__category-concept category-concept mb-2 flex items-center gap-2 min-[1280px]:mb-0">
      <ProductRatingStars v-if="hotelStarCount" :count="hotelStarCount" variant="card"/>
      <span v-else class="product-card-details__category-name category-name text-coral-main-yellow">{{
          hotelCategoryName
        }}</span>
      <div class="product-card-details__concepts concepts flex items-center gap-2">
				<span
            v-if="hotel.eliteHotel"
            class="product-card-details__elite-service-badge elite-service-badge inline-grid h-6 place-content-center rounded-[6px] bg-coral-elite px-3 text-[12px] font-light leading-none text-white"
        ><span class="text-[12px]">ELITE SERVICE</span></span>
        <img
            v-if="hotel.sunFamilyClub || hotel.coralFamilyClub"
            class="product-card-details__cfc-badge cfc-badge block h-6 w-auto"
            :src="cfcBadgeIcon"
            alt=""
            aria-hidden="true"
        >
      </div>
    </div>

    <ul class="product-card-details__terms terms m-0 flex list-none flex-wrap items-baseline gap-1 p-0 text-[12px] min-[1280px]:my-4">
      <ProductTermItem
          v-if="offer.flight"
          icon="flight"
          class="product-card-details__term product-card-details__term--departure departure"
          icon-class="product-card-details__term-icon product-card-details__term-icon--departure h-3 w-5.5 object-contain"
      >
        из {{ $cityGenitiveCase(selectedDepartureName) }}
      </ProductTermItem>
      <ProductTermItem
          icon="calendar"
          class="product-card-details__term product-card-details__term--begin-date begin-date"
          icon-class="product-card-details__term-icon product-card-details__term-icon--begin-date h-3 w-3.5 object-contain"
      >
        {{ beginDate }}
      </ProductTermItem>
      <ProductTermItem
          icon="bed"
          class="product-card-details__term product-card-details__term--stay-nights stay-nights"
          icon-class="product-card-details__term-icon product-card-details__term-icon--stay-nights h-3 w-4.25 object-contain"
      >
        {{ offer.stayNights }} {{ offer.stayNights.asNights() }}
      </ProductTermItem>
      <ProductTermItem
          icon="meal"
          class="product-card-details__term product-card-details__term--meal-type meal-type"
          icon-class="product-card-details__term-icon product-card-details__term-icon--meal-type h-3 w-4.75 object-contain"
      >
        {{ mealType }}
      </ProductTermItem>
    </ul>

    <ul
        v-if="hotelUspsList?.length"
        class="product-card-details__usps usps m-0 grid max-h-34.25 list-none grid-flow-col grid-rows-[repeat(auto-fill,minmax(16px,min-content))] gap-x-4 gap-y-1 border-t border-primary/25 pt-2 text-[14px] min-[1280px]:block min-[1280px]:border-0 min-[1280px]:pt-0 min-[1280px]:pl-2 min-[1280px]:text-[12px]"
    >
      <li
          v-for="usp in hotelUspsList"
          :key="usp"
          class="product-card-details__usp-item flex"
      >
        <span class="product-card-details__usp-bullet mr-1.5 text-primary min-[1280px]:text-black">•</span>
        <span>{{ usp }}</span>
      </li>
    </ul>
  </div>
</template>
