<script setup>
import {computed} from "vue";

const props = defineProps({
  oldPrice: {
    type: String,
    default: ''
  },
  finalPrice: {
    type: String,
    default: ''
  },
  fromLabel: {
    type: String,
    default: 'цена от'
  },
  variant: {
    type: String,
    default: 'card'
  }
});

const hasPriceSuffix = computed(() => {
  const value = String(props.finalPrice || '').toLowerCase();
  return value.includes('per-person')
    || value.includes('per-night')
    || value.includes('/ чел')
    || value.includes('за ночь');
});

const showHardcodedPerPersonSuffix = computed(() => {
  return props.variant === 'card' && Boolean(props.finalPrice) && !hasPriceSuffix.value;
});
</script>

<template>
  <div
      :class="[
      'product-price-block whitespace-nowrap leading-none',
      variant === 'card' ? 'product-price-block--card' : 'product-price-block--marker'
    ]"
  >
    <div
        :class="[
        'product-price-block__from leading-3.5',
        variant === 'card'
          ? 'text-[10px] text-coral-grey'
          : 'text-[20px] text-black/45 max-[768px]:text-[14px]'
      ]"
    >
      {{ fromLabel }}
    </div>

    <div
        :class="[
        'product-price-block__price flex',
        variant === 'card'
          ? 'flex-col'
          : 'flex-wrap items-end gap-x-3 gap-y-1.5 max-[768px]:gap-x-2.5'
      ]"
    >
      <div
          v-if="oldPrice"
          :class="[
          'product-price-block__old leading-5.5',
          variant === 'card'
            ? 'text-[14px] text-coral-grey line-through decoration-destructive'
            : 'text-[20px] leading-none text-black/55 max-[768px]:text-[14px]'
        ]"
      >
        {{ oldPrice }}
      </div>

      <div
          :class="[
        'product-price-block__final text-primary font-semibold leading-7',
        variant === 'card'
          ? 'inline-flex items-baseline gap-1 text-[24px] [&_.per-night]:text-[62%] [&_.per-night]:font-light [&_.per-person]:text-[62%] [&_.per-person]:font-light'
          : 'text-[52px] leading-none max-[768px]:text-[18px]'
      ]"
      >
        <span class="product-price-block__final-value" v-html="finalPrice"></span>
        <span v-if="showHardcodedPerPersonSuffix" class="per-person"> / чел</span>
      </div>
    </div>
  </div>
</template>
