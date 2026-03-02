<script setup>
import {Skeleton} from "app/components/ui/skeleton";

defineProps({
  isHotelOnly: {
    type: Boolean,
    default: false
  },
  tourType: {
    type: String,
    default: 'package'
  },
  fetchingHotelOffer: {
    type: Boolean,
    default: false
  },
  offer: {
    type: Object,
    required: true
  },
  offerListPriceFormatted: {
    type: String,
    default: ''
  },
  offerFinalPriceFormatted: {
    type: String,
    default: ''
  },
  offerHref: {
    type: String,
    required: true
  },
  isOpen: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['update:tourType']);

function setTourType(value) {
  emit('update:tourType', value);
}
</script>

<template>
  <div class="pricing" :class="{ open: isOpen }">
    <div class="tour-type">
      <button v-if="!isHotelOnly" class="package" :class="{ selected: tourType === 'package' }"
              @click.stop="setTourType('package')">Тур с перелетом
      </button>
      <button class="only-hotel" :class="{ selected: isHotelOnly || tourType === 'hotel' }"
              @click.stop="setTourType('hotel')">Только отель
      </button>
    </div>

    <div class="price">
      <template v-if="fetchingHotelOffer">
        <Skeleton v-if="offer.price.oldAmount" class="sk sk--list-price"/>
        <Skeleton class="sk sk--final-price"/>
      </template>
      <template v-else>
        <div v-if="offer.price.oldAmount" class="list-price">{{ offerListPriceFormatted }}</div>
        <div class="final-price" v-html="offerFinalPriceFormatted"></div>
      </template>
    </div>

    <a v-if="!fetchingHotelOffer" :href="offerHref" class="do-choose" target="_blank" @click.stop>Выбрать</a>
    <Skeleton v-else class="sk sk--button"/>
  </div>
</template>

<style scoped lang="less">
@import "../../common/css/layout";
@import "../../common/css/coral-colors";

.pricing {
  width: 100%;
  display: flex;
  gap: 0;

  &.open {
    gap: 1em;
    margin-top: .5em;

    .final-price {
      font-size: 1.2em;
      font-weight: bold;
    }
  }

  &:not(.open) {
    .tour-type {
      display: none;
    }

    .do-choose {
      display: none;
    }

    .list-price {
      display: none;
    }
  }

  .tour-type {
    flex: 0 1;
    width: 100%;
    display: flex;
    flex-direction: column;
    font-size: .66em;
    white-space: nowrap;

    button {
      flex: 1;
      .interactive();
      background: transparent;
      font-size: inherit;
      line-height: 1.4;
      place-content: center;
      border: 1px solid fade(black, 15%);
      .transit(color);
      cursor: pointer;

      &.selected {
        position: relative;
        z-index: 1;
        pointer-events: none;
        color: @coral-main-blue;
        border-color: currentColor;
      }

      &:nth-of-type(n+2) {
        margin-top: -1px;
      }

      &:first-of-type {
        border-top-left-radius: .5em;
        border-top-right-radius: .5em;
      }

      &:last-of-type {
        border-bottom-left-radius: .5em;
        border-bottom-right-radius: .5em;
      }
    }
  }

  .price {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: space-evenly;

    .sk {
      display: block;
      border-radius: .35em;
    }

    .sk--list-price {
      width: 5.2em;
      height: .72em;
    }

    .sk--final-price {
      width: 7.6em;
      height: 1.15em;
      margin-top: .2em;
    }

    .list-price {
      text-decoration: line-through @coral-red-error;
      font-size: .7em;
    }
  }

  .sk--button {
    width: 100%;
    height: 2.6em;
    border-radius: .5em;
  }

  .do-choose {
    .interactive();
    display: grid;
    place-content: center;
    font-size: (12/14em);
    font-weight: 300;
    text-decoration: none;
    color: white;
    background: @coral-main-blue;
    border-radius: .5em;
    padding: 0 1em;
  }
}
</style>
