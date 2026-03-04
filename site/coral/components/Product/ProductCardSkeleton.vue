<script setup>
import {Card, CardContent, CardFooter} from "app/components/ui/card";
import {Skeleton} from "app/components/ui/skeleton";
</script>

<template>
  <Card class="product-card-skeleton rounded-[20px] border border-border bg-white p-2 min-[1280px]:grid min-[1280px]:grid-cols-[300px_minmax(0,1fr)_300px] min-[1280px]:items-stretch min-[1280px]:gap-4">
    <CardContent class="product-card-skeleton__content block p-0 min-[1280px]:col-span-2 min-[1280px]:grid min-[1280px]:min-w-0 min-[1280px]:grid-cols-[300px_minmax(0,1fr)] min-[1280px]:gap-4">
      <Skeleton class="product-card-skeleton__visual h-[200px] w-full rounded-[12px] min-[1280px]:h-full min-[1280px]:min-h-[240px]"/>

      <div class="product-card-skeleton__details grid content-start gap-[10px] py-2 min-[1280px]:min-w-0 min-[1280px]:justify-center min-[1280px]:gap-0 min-[1280px]:py-2">
        <Skeleton class="product-card-skeleton__location h-3 w-[160px]"/>
        <Skeleton class="product-card-skeleton__title h-6 w-[78%] min-[1280px]:mb-2"/>
        <Skeleton class="product-card-skeleton__meta h-3 w-[92%] min-[1280px]:my-4"/>
        <Skeleton class="product-card-skeleton__meta product-card-skeleton__meta--short h-3 w-[64%] min-[1280px]:my-0"/>
      </div>
    </CardContent>

    <CardFooter class="product-card-skeleton__footer mt-2 grid gap-2 border-t border-[rgba(0,0,0,0.1)] pb-0 pl-0 pr-0 pt-2 min-[1280px]:col-start-3 min-[1280px]:row-start-1 min-[1280px]:mt-0 min-[1280px]:flex min-[1280px]:flex-col min-[1280px]:gap-4 min-[1280px]:border-l min-[1280px]:border-t-0 min-[1280px]:border-black/10 min-[1280px]:pl-3 min-[1280px]:pt-0">
      <Skeleton class="product-card-skeleton__price-label h-[10px] w-[72px] min-[1280px]:mt-auto"/>
      <Skeleton class="product-card-skeleton__price h-6 w-[188px]"/>
      <Skeleton class="product-card-skeleton__cashback h-11 w-full rounded-[8px]"/>
      <Skeleton class="product-card-skeleton__button h-12 w-full rounded-[8px]"/>
    </CardFooter>
  </Card>
</template>
