<script setup>
import {computed, toRef} from "vue";
import {Card, CardContent} from "app/components/ui/card";
import {useProductOffer} from "app/composables/useProductOffer";
import {useProductContext} from "app/composables/useProductContext";
import ProductCardVisual from "./ProductCardVisual.vue";
import ProductRatingStars from "./ProductRatingStars.vue";
import ProductPriceBlock from "./ProductPriceBlock.vue";
import ProductHotelName from "./ProductHotelName.vue";
import ProductTourTypeSwitch from "./ProductTourTypeSwitch.vue";

const props = defineProps({
	product: {
		type: Object,
		required: true
	}
});
const emit = defineEmits(['close']);

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
const isEliteHotel = computed(() => Boolean(hotel.eliteHotel));
const mapOverlayAccent = computed(() => isEliteHotel.value ? '#B6985B' : 'var(--coral-main-blue)');
const mapOverlayStyle = computed(() => ({
	'--map-overlay-accent': mapOverlayAccent.value,
	'--map-overlay-font-family': isEliteHotel.value ? '"Trajan Pro 3", serif' : 'inherit',
	'--primary': mapOverlayAccent.value,
	'--color-primary': 'var(--primary)'
}));
</script>

<template>
	<Card
			class="map-overlay-card mb-2 mx-2 w-fit min-w-0 rounded-2xl border border-border bg-white p-1.5 shadow-[0_10px_28px_rgba(0,0,0,0.16)]"
			:style="mapOverlayStyle">
		<CardContent
				class="map-overlay-card__content relative grid min-w-0 grid-cols-[120px_minmax(0,1fr)] items-stretch gap-2.5 p-0 max-[768px]:grid-cols-[120px_minmax(0,1fr)] max-[768px]:gap-2">
			<button
					class="popup-close absolute  w-5 h-5 right-0 top-0 z-10 inline-flex items-center justify-center rounded-sm border border-[#d9d9d9] bg-white p-0"
					type="button"
					aria-label="Закрыть"
					@click="emit('close')"
			>
				<svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true" class="w-[50%] h-[50%]">
					<path d="M14.6666 1.3335L1.33331 14.6668" stroke="#535353"></path>
					<path d="M1.33329 1.3335L14.6666 14.6668" stroke="#535353"></path>
				</svg>
			</button>
			<div class="map-overlay-card__visual-wrap relative min-w-0 overflow-hidden rounded-[12px]">
				<ProductCardVisual
						class="map-overlay-card__visual absolute inset-0 h-full w-full min-w-0 min-[1024px]:min-h-0"
						:hotel="hotel"
						:offer-href="offerHref"
						image-class="absolute inset-0 h-full w-full min-h-0 min-[1024px]:min-h-0"
						badges-class="hidden"
				/>
			</div>

			<div class="map-overlay-card__main flex min-w-0 flex-col gap-1 py-0">
				<ProductTourTypeSwitch
						v-model="tourType"
						:is-hotel-only="isHotelOnly"
						package-label="Тур"
						hotel-label="Отель"
						class="map-overlay-card__toggle mb-0 mr-auto self-end w-auto min-w-33 [&_.product-tour-type-switch__item]:h-8 [&_.product-tour-type-switch__item]:px-2.5 [&_.product-tour-type-switch__item]:text-[12px] [&_.product-tour-type-switch__item]:leading-none [&_.product-tour-type-switch__item[data-state=on]]:text-(--map-overlay-accent) [&_.product-tour-type-switch__item[data-state=on]]:border-(--map-overlay-accent)"
				/>

				<div class="map-overlay-card__hotel-head min-w-0">
					<ProductHotelName
							:offer-href="offerHref"
							:name="hotel.name"
							link-class="map-overlay-card__hotel-link text-inherit no-underline hover:underline"
							:title-class="[
								'map-overlay-card__name m-0 break-words text-[16px] leading-[1.15] min-[1024px]:text-[20px]',
								isEliteHotel ? 'font-normal text-black [font-family:var(--map-overlay-font-family)] leading-[1.2] min-[1024px]:tracking-[0.015em]' : 'font-bold text-black'
							]"
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
						class="map-overlay-card__price-block mt-auto [&_.product-price-block__from]:text-[10px] [&_.product-price-block__old]:text-[12px] [&_.price-suffix--default]:text-[16px] [&_.product-price-block__final]:text-(--map-overlay-accent)"
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
