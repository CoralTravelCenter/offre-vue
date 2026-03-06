<script setup>
import {computed, toRef} from "vue";
import {Card, CardContent} from "app/components/ui/card";
import {Switch} from "app/components/ui/switch";
import {useProductOffer} from "../../composables/useProductOffer";
import {useProductContext} from "../../composables/useProductContext";
import ProductCardVisual from "./ProductCardVisual.vue";
import ProductRatingStars from "./ProductRatingStars.vue";
import ProductPriceBlock from "./ProductPriceBlock.vue";
import ProductHotelName from "./ProductHotelName.vue";

const props = defineProps({
	product: {
		type: Object,
		required: true
	}
});

const {
	widgetOptions,
	widgetHotelsList,
	sharedTourTypeByHotelId,
	productReference
} = useProductContext();
const {getReferenceValueByKey} = productReference;

const {
	hotel,
	tourType,
	offer,
	offerFinalPriceFormatted,
	offerListPriceFormatted,
	isHotelOnly,
	offerHref
} = useProductOffer({
	product: toRef(props, 'product'),
	widgetOptions,
	widgetHotelsList,
	sharedTourTypeByHotelId,
	priceLabelMode: 'detailed'
});

const hotelCategory = computed(() => getReferenceValueByKey('hotelCategories', hotel.categoryKey) || {});
const hotelStarCount = computed(() => hotelCategory.value.starCount || 0);
const isPackageTourType = computed({
	get() {
		return !isHotelOnly.value && tourType.value === 'package';
	},
	set(value) {
		if (isHotelOnly.value) {
			tourType.value = 'hotel';
			return;
		}
		tourType.value = value ? 'package' : 'hotel';
	}
});
const mapTourTypeLabel = computed(() => {
	return isPackageTourType.value ? 'Тур с перелетом' : 'Только отель';
});

function setMapTourType(nextType) {
	if (isHotelOnly.value && nextType !== 'hotel') {
		return;
	}
	tourType.value = nextType;
}
</script>

<template>
	<Card
			class="map-overlay-card mb-2 w-[calc(100%-16px)] min-w-0 rounded-2xl border border-border bg-white p-1.5 shadow-[0_10px_28px_rgba(0,0,0,0.16)]">
		<CardContent
				class="map-overlay-card__content grid min-w-0 grid-cols-[120px_minmax(0,1fr)] items-stretch gap-2.5 p-0 max-[768px]:grid-cols-[120px_minmax(0,1fr)] max-[768px]:gap-2">
			<div class="map-overlay-card__visual-wrap relative min-w-0 overflow-hidden rounded-[12px]">
				<ProductCardVisual
						class="map-overlay-card__visual absolute inset-0 h-full w-full min-w-0 [&_img]:!absolute [&_img]:!inset-0 [&_img]:!h-full [&_img]:!w-full [&_img]:!min-h-0 [&_.badge-grid]:hidden"
						:hotel="hotel"
						:offer-href="offerHref"
				/>
			</div>

			<div class="map-overlay-card__main flex min-w-0 flex-col gap-1 py-0">
				<div
						class="map-overlay-card__toggle mb-0 flex items-center gap-2 self-end rounded-[8px] border border-coral-stroke-soft bg-white p-1.5">
					<Switch
							class="map-overlay-card__toggle-switch h-4.5 w-7 shrink-0 **:data-[slot=switch-thumb]:size-3.5"
							v-model="isPackageTourType"
							:disabled="isHotelOnly"
							title="Переключить формат тура"
							aria-label="Переключить формат тура"
					/>
					<button
							type="button"
							class="map-overlay-card__toggle-label text-[11px] leading-[1.2] font-medium text-foreground transition-colors hover:text-primary"
							:title="mapTourTypeLabel"
							:aria-label="mapTourTypeLabel"
							@click="setMapTourType(isPackageTourType ? 'hotel' : 'package')"
					>
						{{ mapTourTypeLabel }}
					</button>
				</div>

				<div class="map-overlay-card__hotel-head min-w-0">
					<ProductHotelName
							:offer-href="offerHref"
							:name="hotel.name"
							link-class="map-overlay-card__hotel-link text-inherit no-underline hover:underline"
							title-class="map-overlay-card__name m-0 break-words text-[16px] font-bold leading-[1.15] text-black"
					/>
				</div>

				<ProductRatingStars
						v-if="hotelStarCount"
						class="map-overlay-card__rating mb-0"
						:count="hotelStarCount"
						star-class="h-[15px] w-[15px]"
						variant="card"
				/>

				<ProductPriceBlock
						class="map-overlay-card__price-block mt-auto [&_.product-price-block__from]:text-[10px] [&_.product-price-block__old]:text-[12px] [&_.price-suffix--default]:text-[16px]"
						from-label="цена от"
						final-value-class="text-[20px]"
						:old-price="offer.price.oldAmount ? offerListPriceFormatted : ''"
						:final-price="offerFinalPriceFormatted"
						variant="card"
				/>
			</div>
		</CardContent>
	</Card>
</template>
