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
  <div class="product-price-block" :class="`product-price-block--${variant}`">
    <div class="product-price-block__from">{{ fromLabel }}</div>
    <div class="product-price-block__price">
      <div v-if="oldPrice" class="product-price-block__old">{{ oldPrice }}</div>
      <div class="product-price-block__final" v-html="finalPrice"></div>
    </div>
  </div>
</template>

<style scoped lang="less">
@import "../../common/css/coral-colors";

.product-price-block {
  line-height: 1;
  white-space: nowrap;
}

.product-price-block__from {
  color: @coral-grey;
}

.product-price-block__price {
  display: flex;
}

.product-price-block__old {
  text-decoration: line-through @coral-red-error;
}

.product-price-block__final {
  color: @coral-main-blue;
  font-weight: 600;
}

.product-price-block--card .product-price-block__from {
  font-size: 10px;
}

.product-price-block--card .product-price-block__price {
  flex-direction: column;
  gap: 4px;
}

.product-price-block--card .product-price-block__old {
  font-size: 12px;
}

.product-price-block--card .product-price-block__final {
  display: inline-flex;
  align-items: baseline;
  gap: 4px;
  font-size: 24px;
}

.product-price-block--card .product-price-block__final :deep(.per-night) {
  font-size: 62%;
  font-weight: 300;
}

.product-price-block--marker .product-price-block__from {
  color: fade(black, 45%);
  font-size: 20px;
}

.product-price-block--marker .product-price-block__price {
  align-items: flex-end;
  flex-wrap: wrap;
  gap: 12px;
}

.product-price-block--marker .product-price-block__old {
  font-size: 20px;
  color: fade(black, 55%);
  line-height: 1;
}

.product-price-block--marker .product-price-block__final {
  font-size: 52px;
  line-height: 1;
}

@media screen and (max-width: 768px) {
  .product-price-block--marker .product-price-block__from {
    font-size: 14px;
  }

  .product-price-block--marker .product-price-block__price {
    gap: 6px 10px;
  }

  .product-price-block--marker .product-price-block__old {
    font-size: 14px;
  }

  .product-price-block--marker .product-price-block__final {
    font-size: 18px;
  }
}
</style>
