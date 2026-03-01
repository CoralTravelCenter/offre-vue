<script setup>
defineProps({
  initialLoading: {
    type: Boolean,
    default: false
  },
  productsLoading: {
    type: Number,
    default: 0
  },
  noMatchedProducts: {
    type: Boolean,
    default: false
  },
  selectedRegion: {
    type: [String, Number],
    default: undefined
  },
  selectedDeparture: {
    type: Object,
    default: () => ({})
  }
});
</script>

<template>
  <div v-if="!productsLoading && noMatchedProducts && selectedRegion" class="message-hint no-matched-products">
    <div class="icon warning"></div>
    <div class="reason">Из {{ $cityGenitiveCase(selectedDeparture.name) }} в данной подборке отелей нет подходящих вариантов.</div>
    <div class="hint">Пожалуйста, попробуйте поменять условия выбора &mdash; регион / город вылета / период путешествия</div>
  </div>

  <div v-if="initialLoading" class="message-hint initial-loading">
    <div class="icon info"></div>
    <div class="reason">Ищем варианты</div>
    <div class="hint">Пожалуйста, подождите...</div>
  </div>
</template>

<style scoped lang="less">
@import "../../common/css/layout";
@import "../../common/css/coral-colors";

.message-hint {
  display: grid;
  grid-template: auto auto / auto auto;
  gap: 1em 2em;
  padding: 2em;
  border-radius: 1em;

  &.no-matched-products {
    background: fade(@coral-main-yellow, 5%);
  }

  &.initial-loading {
    background: fade(@coral-main-blue, 5%);
  }

  .icon {
    grid-area: 1 / 1 / -1 / 2;
    justify-self: end;
    @media screen and (max-width: @narrow-breakpoint) {
      width: 2.5em;
      height: 2.5em;
    }
  }

  .reason {
    grid-area: 1 / 2;
    font-weight: 600;
  }

  .hint {
    grid-area: 2 / 2;
    font-weight: 300;
  }
}

.icon {
  width: 4em;
  height: 4em;
  background: center / cover no-repeat;

  &.warning {
    background-image: url("data-url:/site/coral/assets-inline/icon-warning.svg");
  }

  &.info {
    background-image: url("data-url:/site/coral/assets-inline/icon-info.svg");
  }
}
</style>
