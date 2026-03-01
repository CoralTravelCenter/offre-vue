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
  selectedDepartureName: {
    type: String,
    default: ''
  },
  beginDate: {
    type: String,
    required: true
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
  isOpen: {
    type: Boolean,
    default: false
  }
});
</script>

<template>
  <div class="info" :class="{ open: isOpen }">
    <div class="category-concept">
      <div v-if="hotelStarCount" class="stars">
        <span v-for="n in hotelStarCount" :key="`marker-filled-${n}`" class="filled"></span>
        <span v-for="n in (5 - hotelStarCount)" :key="`marker-empty-${n}`" class="empty"></span>
      </div>
      <span v-else class="category-name">{{ hotelCategoryName }}</span>
      <div class="concepts">
        <span v-if="hotel.eliteHotel" class="elite-service-badge"><span>ELITE SERVICE</span></span>
        <span v-if="hotel.sunFamilyClub || hotel.coralFamilyClub" class="cfc-badge"></span>
      </div>
    </div>

    <h3 class="name">{{ hotel.name }}</h3>

    <ul class="terms">
      <li v-if="offer.flight" class="departure">из {{ $cityGenitiveCase(selectedDepartureName) }}</li>
      <li class="begin-date">{{ beginDate }}</li>
      <li class="stay-nights">{{ offer.stayNights }} {{ offer.stayNights.asNights() }}</li>
      <li class="meal-type">{{ mealType }}</li>
    </ul>
  </div>
</template>

<style scoped lang="less">
@import "../../common/css/layout";
@import "../../common/css/coral-colors";

.info {
  &.open {
    font-size: 1em;
  }

  &:not(.open) {
    font-size: 0;
  }

  .category-concept {
    font-size: (12/14em);
    margin-bottom: .75em;
    display: flex;
    align-items: center;

    .category-name {
      color: @coral-main-yellow;
    }

    .concepts {
      margin-left: auto;
      display: flex;
      align-items: center;
      gap: 1em;

      .elite-service-badge {
        display: inline-grid;
        place-content: center;
        padding: 0 .5em;
        font-weight: 300;
        background-color: #333;
        color: white;
        font-size: 1.2em;
        height: 1em;
        white-space: nowrap;

        > span {
          font-size: .62em;
          letter-spacing: .15em;
        }
      }

      .cfc-badge {
        display: block;
        aspect-ratio: 153/35;
        font-size: 1.25em;
        height: 1em;
        background: url("data-url:/site/coral/assets-inline/coral-family-club.svg") center / cover no-repeat;
      }
    }
  }

  .stars {
    display: inline-grid;
    grid-template-columns: repeat(5, auto);
    gap: 2px;
    margin-right: 1em;

    > * {
      width: 1.2em;
      height: (96/101) * 1.2em;
      background: center / cover no-repeat;

      &.filled {
        background-image: url(data-url:/site/coral/assets-inline/rating-star-filled.svg);
      }

      &.empty {
        background-image: url(data-url:/site/coral/assets-inline/rating-star-empty.svg);
      }
    }
  }

  .name {
    font-size: inherit;
    line-height: 1;
    margin: 0;
    white-space: nowrap;
  }

  ul.terms {
    display: flex;
    align-items: baseline;
    white-space: nowrap;
    gap: 1em;
    list-style: none;
    margin: .5em 0 0 0;
    padding: 0;
    font-size: .66em;

    > li {
      display: inline-flex;
      align-items: center;

      &:before {
        content: '';
        height: 1.2em;
        margin-right: .5em;
        background: center / cover no-repeat;
      }

      &.departure:before {
        width: (42/33) * 1.2em;
        background-image: url(data-url:/site/coral/assets-inline/icon-flight.svg);
      }

      &.begin-date:before {
        width: (32/33) * 1.2em;
        background-image: url(data-url:/site/coral/assets-inline/icon-cal.svg);
      }

      &.stay-nights:before {
        width: (40/33) * 1.2em;
        background-image: url(data-url:/site/coral/assets-inline/icon-bed.svg);
      }

      &.meal-type:before {
        width: (43/33) * 1.2em;
        background-image: url(data-url:/site/coral/assets-inline/icon-meal.svg);
      }
    }
  }
}
</style>
