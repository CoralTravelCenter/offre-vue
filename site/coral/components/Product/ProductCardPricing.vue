<script setup>
import {Popover, PopoverContent, PopoverTrigger} from "app/components/ui/popover";
import {Button} from "app/components/ui/button";
import {ToggleGroup, ToggleGroupItem} from "app/components/ui/toggle-group";
import {computed} from "vue";

const props = defineProps({
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
  cashbackInfo: {
    type: Object,
    default: undefined
  },
  offerHref: {
    type: String,
    required: true
  }
});

const emit = defineEmits(['update:tourType']);

function setTourType(value) {
  emit('update:tourType', value);
}

const selectedTourType = computed(() => (props.isHotelOnly ? 'hotel' : props.tourType));

function setTourTypeFromToggle(value) {
  if (!value || value === props.tourType) {
    return;
  }
  setTourType(value);
}
</script>

<template>
  <div class="pricing">
    <ToggleGroup
        class="w-full"
        type="single"
        variant="outline"
        :model-value="selectedTourType"
        @update:model-value="setTourTypeFromToggle"
    >
      <ToggleGroupItem
          class="flex-1 data-[state=on]:bg-transparent  data-[state=on]:text-[#0092D0] data-[state=on]:border-[#0092D0]"
          v-if="!isHotelOnly"
          value="package"
      >
        Тур с перелетом
      </ToggleGroupItem>
      <ToggleGroupItem
          class="flex-1 data-[state=on]:bg-transparent  data-[state=on]:text-[#0092D0] data-[state=on]:border-[#0092D0]"
          value="hotel"
      >
        Только отель
      </ToggleGroupItem>
    </ToggleGroup>

    <div class="tour-info" :class="{ blocked: props.fetchingHotelOffer }">
      <div class="price-discount">
        <div class="price">
          <div class="from-wording">цена от:</div>
          <div v-if="props.offer.price.oldAmount" class="list-price">{{ props.offerListPriceFormatted }}</div>
          <div class="final-price">
            <span class="final-price__value" v-html="props.offerFinalPriceFormatted"></span>
            <span class="per-person">/ чел</span>
          </div>
        </div>
        <div class="discount" v-if="props.offer.price.discountPercent">
          {{ props.offer.price.discountPercent }}% Скидка
        </div>
      </div>

      <div v-if="props.cashbackInfo" class="cashback">
        <div class="info">
          <span class="up-to">Кешбэк до {{ props.cashbackInfo?.finalBonus?.formatCurrency?.() ?? '' }}</span>
          <span class="to-coral-bonus-card">на карту CoralBonus</span>
        </div>
        <Popover>
          <PopoverTrigger as-child>
            <button type="button" class="cashback-trigger" aria-label="Показать условия кешбэка CoralBonus">
              <img class="card-visual" src="https://b2ccdn.coral.ru/content/cb_24.png" alt="">
            </button>
          </PopoverTrigger>
          <PopoverContent
              side="top"
              align="end"
              :align-offset="-16"
              :avoid-collisions="false"
              show-arrow
              :arrow-width="16"
              :arrow-height="8"
              arrow-rounded
          >
            <div class="offre-vue-cashback-popover">
              <div class="promos-grid">
                <template v-for="promo in (props.cashbackInfo?.listOfPromos ?? [])" :key="promo.content_txt">
                  <span class="value">{{ promo.content_result?.formatCurrency?.() ?? '' }}</span>
                  <a v-if="promo.content_link" :href="promo.content_link" class="description"
                     target="_blank">{{ promo.content_txt }}</a>
                  <span v-else class="description">{{ promo.content_txt }}</span>
                </template>
                <div class="info-action">
                  <div class="info">Для начисления бонусов, укажите номер карты в&nbsp;поле "Примечание к&nbsp;заказу"
                  </div>
                  <a href="https://coralbonus.ru/registration?promo=R3R5VO93GKG8N1PGQC1UP0G6EICQLRWEN3Z64WZGC4YBYIKHFJV55IND5O20WUJ"
                     class="action" target="_blank">Активировать</a>
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      <Button as="a" :href="props.offerHref" class="do-choose" target="_blank">Выбрать</Button>
    </div>
  </div>
</template>

<style lang="less">
@import "../../common/css/coral-colors";
@import "../../common/css/layout";

.pricing {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
  padding: 8px 0 0 0;
  border-top: 1px solid fade(black, 10%);
}

.pricing .tour-type {
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: 1fr;
  width: 100%;
  font-size: 14px;
  border: 1px solid fade(black, 15%);
  border-radius: 7px;
  overflow: hidden;
}

.pricing .tour-type :deep(.tour-type__item) {
  .interactive();
  position: relative;
  width: 100%;
  height: 32px;
  padding: 0 10px;
  justify-content: center;
  font-size: inherit;
  line-height: 1;
  color: inherit;
  background: transparent;
  border: 1px solid fade(black, 15%);
  border-radius: 0;
  box-shadow: none;
  cursor: pointer;
  transition: color .2s ease, background-color .2s ease;
}

.pricing .tour-type :deep(.tour-type__item[data-state='on']) {
  color: @coral-main-blue;
  background: white;
  border-color: @coral-main-blue;
  pointer-events: none;
}

.pricing .tour-type :deep(.tour-type__item[data-state='off']) {
  color: #1f2227;
}

.pricing .tour-type :deep(.tour-type__item:not(:first-child)) {
  margin-left: -1px;
}

.pricing .tour-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
  .transit(opacity, .25s);
  .transit(filter, .25s);
}

.pricing .tour-info.blocked {
  pointer-events: none;
  opacity: .3;
  filter: blur(4px);
}

.pricing .price-discount {
  position: relative;
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: flex-end;
}

.pricing .price-discount .price {
  line-height: 1;
  white-space: nowrap;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.pricing .price-discount .from-wording {
  font-size: 10px;
  color: @coral-grey;
}

.pricing .price-discount .list-price {
  font-size: 12px;
  text-decoration: line-through @coral-red-error;
}

.pricing .price-discount .final-price {
  display: inline-flex;
  align-items: baseline;
  gap: 4px;
  font-size: 24px;
  font-weight: 600;
  color: @coral-main-blue;
}

.pricing .price-discount .final-price .per-person {
  font-size: 62%;
  font-weight: 400;
}

.pricing .price-discount .final-price :deep(.per-night) {
  font-size: 62%;
  font-weight: 300;
}

.pricing .price-discount .discount {
  position: absolute;
  right: 4px;
  bottom: 0;
  display: grid;
  place-content: center;
  height: 24px;
  padding: 0 12px;
  font-size: 12px;
  line-height: 1;
  color: white;
  background: #52C41A;
  border-radius: 6px 6px 0 6px;
  transform: translateX(22px);
}

.pricing .price-discount .discount::after {
  content: '';
  position: absolute;
  top: 100%;
  right: 0;
  width: 10px;
  height: 7px;
  background: linear-gradient(to bottom right, darken(#52C41A, 10%) 50%, transparent 55%);
}

.pricing .cashback {
  display: grid;
  grid-template-columns: 1fr auto;
  width: 100%;
  margin: 0;
  padding: 6px 8px 6px 12px;
  text-align: left;
  background: #FEEFCD;
  border-radius: 8px;
}

.pricing .cashback .cashback-trigger {
  align-self: center;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin: 0;
  padding: 0;
  border: 0;
  border-radius: 6px;
  background: transparent;
  cursor: pointer;
}

.pricing .cashback .cashback-trigger:focus-visible {
  outline: 2px solid fade(@coral-main-blue, 45%);
  outline-offset: 2px;
}

.pricing .cashback .card-visual {
  width: 54px;
  height: 33px;
  object-fit: cover;
  align-self: center;
  transform-origin: center;
  will-change: transform, filter;
  animation: cashback-card-pulse 10s ease-in-out infinite;
}

.pricing .cashback .info {
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.pricing .cashback .up-to {
  font-size: 14px;
  font-weight: 600;
}

.pricing .cashback .to-coral-bonus-card {
  display: flex;
  align-items: center;
  font-size: 12px;
}

.pricing .do-choose {
  display: block;
  text-align: center;
  padding: 13px;
  height: 48px;
  font-size: 16px;
  text-decoration: none;
  color: white;
  background: @coral-main-blue;
  border-radius: 8px;
  line-height: 1.3;
  flex-shrink: 0;
}

@keyframes cashback-card-pulse {
  0%, 86%, 100% {
    transform: scale(1);
    filter: none;
  }
  88% {
    transform: scale(1.04);
    filter: drop-shadow(0 0 6px fade(@coral-main-blue, 30%));
  }
  90% {
    transform: scale(1);
    filter: none;
  }
  92% {
    transform: scale(1.03);
    filter: drop-shadow(0 0 5px fade(@coral-main-blue, 24%));
  }
  94% {
    transform: scale(1);
    filter: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .pricing .cashback .card-visual {
    animation: none;
  }
}
</style>
