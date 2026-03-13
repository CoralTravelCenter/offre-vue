<script setup>
import {Card, CardContent, CardFooter} from "app/components/ui/card";
import {Skeleton} from "app/components/ui/skeleton";
</script>

<template>
	<Card
			class="product-card-skeleton rounded-[20px] border border-border bg-white p-2 min-[1280px]:grid min-[1280px]:grid-cols-[300px_minmax(0,1fr)_300px] min-[1280px]:items-stretch min-[1280px]:gap-4">
		<CardContent
				class="product-card-skeleton__content min-w-0 p-0 min-[1280px]:col-span-2 min-[1280px]:grid min-[1280px]:grid-cols-[300px_minmax(0,1fr)] min-[1280px]:items-stretch min-[1280px]:gap-4">
			<Skeleton
					class="product-card-skeleton__visual h-50 w-full rounded-[12px] min-[1280px]:h-full min-[1280px]:min-h-60"/>

			<div
					class="product-card-skeleton__details flex min-w-0 flex-col justify-start py-2 min-[1280px]:justify-center">
				<Skeleton class="product-card-skeleton__location mb-1 h-3 w-40"/>
				<div class="product-card-skeleton__title-wrap mb-1 min-[1280px]:mb-2 min-[1280px]:mt-2">
					<Skeleton class="product-card-skeleton__title h-6 w-[82%]"/>
					<Skeleton class="product-card-skeleton__title mt-1 h-6 w-[56%]"/>
				</div>
				<div class="product-card-skeleton__category mb-2 flex items-center gap-2 min-[1280px]:mb-0">
					<Skeleton class="h-5 w-33"/>
					<Skeleton class="h-5 w-27 rounded-[6px]"/>
				</div>
				<div class="product-card-skeleton__terms flex flex-wrap items-center gap-1 text-[12px] min-[1280px]:my-4">
					<Skeleton class="h-3 w-27"/>
					<Skeleton class="h-3 w-21.5"/>
					<Skeleton class="h-3 w-20.5"/>
					<Skeleton class="h-3 w-23.5"/>
				</div>
				<div
						class="product-card-skeleton__usps border-t border-primary/25 pt-2 min-[1280px]:border-0 min-[1280px]:pt-0 min-[1280px]:pl-2">
					<Skeleton class="h-3 w-[92%]"/>
					<Skeleton class="mt-2 h-3 w-[88%]"/>
					<Skeleton class="mt-2 h-3 w-[76%]"/>
				</div>
			</div>
		</CardContent>

		<CardFooter
				class="product-card-skeleton__footer mt-auto min-w-0 p-0 min-[1280px]:col-start-3 min-[1280px]:row-start-1 min-[1280px]:h-full">
			<div
					class="product-card-skeleton__pricing flex w-full flex-col gap-2 border-t border-coral-stroke-soft pt-2 min-[1280px]:h-full min-[1280px]:justify-start min-[1280px]:gap-4 min-[1280px]:border-l min-[1280px]:border-coral-stroke-soft min-[1280px]:border-t-0 min-[1280px]:pl-3 min-[1280px]:pt-0">
				<Skeleton class="product-card-skeleton__tour-switch h-9 w-full rounded-xl"/>
				<div class="product-card-skeleton__tour-info flex flex-col gap-2 min-[1280px]:mt-auto min-[1280px]:gap-4">
					<Skeleton class="product-card-skeleton__price-label h-2.5 w-18"/>
					<Skeleton class="product-card-skeleton__price h-6 w-47"/>
					<Skeleton class="product-card-skeleton__cashback h-11 w-full rounded-lg"/>
					<Skeleton class="product-card-skeleton__button h-12 w-full rounded-lg"/>
				</div>
			</div>
		</CardFooter>
	</Card>
</template>
