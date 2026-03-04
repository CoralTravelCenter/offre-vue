<script setup>
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
        'product-price-block__from',
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
          ? 'flex-col gap-1'
          : 'flex-wrap items-end gap-x-3 gap-y-[6px] max-[768px]:gap-x-[10px]'
      ]"
    >
      <div
        v-if="oldPrice"
        :class="[
          'product-price-block__old',
          variant === 'card'
            ? 'text-[12px] text-coral-grey line-through decoration-destructive'
            : 'text-[20px] leading-none text-black/55 max-[768px]:text-[14px]'
        ]"
      >
        {{ oldPrice }}
      </div>

      <div
        :class="[
          'product-price-block__final text-primary font-semibold',
          variant === 'card'
            ? 'inline-flex items-baseline gap-1 text-[24px] [&_.per-night]:text-[62%] [&_.per-night]:font-light'
            : 'text-[52px] leading-none max-[768px]:text-[18px]'
        ]"
        v-html="finalPrice"
      ></div>
    </div>
  </div>
</template>
