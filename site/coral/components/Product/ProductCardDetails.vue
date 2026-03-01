<script setup>
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
  <div class="details">
    <div class="location" :class="{ 'has-coordinates': !!hotel.coordinates }" @click="handleLocationClick(hotel)">
      {{ hotel.locationSummary }}
    </div>

    <a :href="offerHref" target="_blank" class="hotel-name">
      <h3 class="name">{{ hotel.name }}</h3>
    </a>

    <div class="category-concept">
      <div v-if="hotelStarCount" class="stars">
        <span v-for="n in hotelStarCount" :key="`star-filled-${n}`" class="filled"></span>
        <span v-for="n in (5 - hotelStarCount)" :key="`star-empty-${n}`" class="empty"></span>
      </div>
      <span v-else class="category-name">{{ hotelCategoryName }}</span>
      <div class="concepts">
        <span v-if="hotel.eliteHotel" class="elite-service-badge"><span>ELITE SERVICE</span></span>
        <span v-if="hotel.sunFamilyClub || hotel.coralFamilyClub" class="cfc-badge"></span>
      </div>
    </div>

    <ul class="terms">
      <li v-if="offer.flight" class="departure">из {{ $cityGenitiveCase(selectedDepartureName) }}</li>
      <li class="begin-date">{{ beginDate }}</li>
      <li class="stay-nights">{{ offer.stayNights }} {{ offer.stayNights.asNights() }}</li>
      <li class="meal-type">{{ mealType }}</li>
    </ul>

    <ul v-if="hotelUspsList?.length" class="usps">
      <li v-for="usp in hotelUspsList" :key="usp">{{ usp }}</li>
    </ul>
  </div>
</template>

<style scoped lang="less">
@import "../../common/css/coral-colors";
@import "../../common/css/layout";

.details {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  padding: 8px 0;
}


.details .location {
  align-self: flex-start;
  display: flex;
  align-items: center;
  font-size: 12px;
  font-weight: 300;
  padding-block: 4px;
  cursor: pointer;
  line-height: 1.3;
  margin-bottom: 4px;
}

.details .location::before {
  content: '';
  width: 12px;
  height: 14px;
  flex-shrink: 0;
  margin-right: 4px;
  margin-bottom: 2px;
  background: url("data-url:/site/coral/assets-inline/location-placemark.svg") center / contain no-repeat;
}

.details .category-concept {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.details .category-name {
  color: @coral-main-yellow;
}

.details .concepts {
  display: flex;
  align-items: center;
  gap: 16px;
}

.details .elite-service-badge {
  display: inline-grid;
  place-content: center;
  height: 24px;
  padding: 0 12px;
  line-height: 1;
  font-size: 12px;
  font-weight: 300;
  color: white;
  border-radius: 6px;
  background-color: #333;
}

.details .elite-service-badge > span {
  font-size: 12px;
}

.details .cfc-badge {
  display: block;
  aspect-ratio: 153/35;
  height: 20px;
  font-size: 20px;
  background: url("data-url:/site/coral/assets-inline/coral-family-club.svg") center / cover no-repeat;
}

.details .hotel-name {
  color: unset;
  text-decoration: none;
  margin-bottom: 4px;
}

.details .hotel-name:hover {
  text-decoration: underline;
}

.details .name {
  font-size: 20px;
  font-weight: 700;
}

.details .stars {
  display: inline-grid;
  grid-template-columns: repeat(5, auto);
  gap: 2px;
}

.details .stars > span {
  width: 18px;
  height: 18px;
  background: center / cover no-repeat;
}

.details .stars > .filled {
  background-image: url(data-url:/site/coral/assets-inline/rating-star-filled.svg);
}

.details .stars > .empty {
  background-image: url(data-url:/site/coral/assets-inline/rating-star-empty.svg);
}

.details .terms {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 4px;
  margin: 0;
  padding: 0;
  list-style: none;
  font-size: 12px;
}

.details .terms > li {
  display: inline-flex;
  align-items: center;
}

.details .terms > li::before {
  content: '';
  height: 1em;
  margin-right: 4px;
  background: center / contain no-repeat;
}

.details .terms > li.departure::before {
  width: 22px;
  background-image: url(data-url:/site/coral/assets-inline/icon-flight.svg);
}

.details .terms > li.begin-date::before {
  width: 14px;
  background-image: url(data-url:/site/coral/assets-inline/icon-cal.svg);
}

.details .terms > li.stay-nights::before {
  width: 17px;
  background-image: url(data-url:/site/coral/assets-inline/icon-bed.svg);
}

.details .terms > li.meal-type::before {
  width: 19px;
  background-image: url(data-url:/site/coral/assets-inline/icon-meal.svg);
}

.details .usps {
  display: grid;
  grid-auto-flow: column;
  grid-template-rows: repeat(auto-fill, minmax(16px, min-content));
  gap: 4px 16px;
  max-height: 137px;
  margin: 0;
  padding: 8px 0 0;
  list-style: none;
  font-size: 14px;
  border-top: 1px solid fade(@coral-main-blue, 25%);
}

.details .usps > li {
  display: flex;
}

.details .usps > li::before {
  content: '\2022';
  margin-right: 6px;
  color: @coral-main-blue;
}
</style>
