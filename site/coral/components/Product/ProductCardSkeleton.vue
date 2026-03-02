<script setup>
import {Card, CardContent, CardFooter} from "app/components/ui/card";
import {Skeleton} from "app/components/ui/skeleton";
</script>

<template>
  <Card class="product-card-skeleton">
    <CardContent class="product-card-skeleton__content">
      <Skeleton class="product-card-skeleton__visual"/>

      <div class="product-card-skeleton__details">
        <Skeleton class="product-card-skeleton__location"/>
        <Skeleton class="product-card-skeleton__title"/>
        <Skeleton class="product-card-skeleton__meta"/>
        <Skeleton class="product-card-skeleton__meta product-card-skeleton__meta--short"/>
      </div>
    </CardContent>

    <CardFooter class="product-card-skeleton__footer">
      <Skeleton class="product-card-skeleton__price-label"/>
      <Skeleton class="product-card-skeleton__price"/>
      <Skeleton class="product-card-skeleton__cashback"/>
      <Skeleton class="product-card-skeleton__button"/>
    </CardFooter>
  </Card>
</template>

<style scoped lang="less">
.product-card-skeleton {
  border-radius: 20px;
  border: 1px solid rgba(0, 0, 0, 0.15);
  background: #ffffff;
  padding: 8px;
}

.product-card-skeleton__content {
  display: block;
  padding: 0;
}

.product-card-skeleton__visual {
  width: 100%;
  height: 200px;
  border-radius: 12px;
}

.product-card-skeleton__details {
  display: grid;
  align-content: start;
  gap: 10px;
  padding: 8px 0;
}

.product-card-skeleton__location {
  width: 160px;
  height: 12px;
}

.product-card-skeleton__title {
  width: 78%;
  height: 24px;
}

.product-card-skeleton__meta {
  width: 92%;
  height: 12px;
}

.product-card-skeleton__meta--short {
  width: 64%;
}

.product-card-skeleton__footer {
  display: grid;
  gap: 8px;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
  margin-top: 8px;
  padding: 8px 0 0 0;
}

.product-card-skeleton__price-label {
  width: 72px;
  height: 10px;
}

.product-card-skeleton__price {
  width: 188px;
  height: 24px;
}

.product-card-skeleton__cashback {
  width: 100%;
  height: 44px;
  border-radius: 8px;
}

.product-card-skeleton__button {
  width: 100%;
  height: 48px;
  border-radius: 8px;
}

@media screen and (max-width: 768px) {
  .product-card-skeleton__visual {
    height: 200px;
  }
}
</style>
