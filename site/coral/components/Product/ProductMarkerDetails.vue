<script setup>
import ProductLocation from "./ProductLocation.vue";
import ProductRatingStars from "./ProductRatingStars.vue";

defineProps({
	hotel: {
		type: Object,
		required: true
	},
	offer: {
		type: Object,
		required: true
	},
	selectedDepartureName: {
		type: String,
		default: ''
	},
	beginDate: {
		type: String,
		required: true
	},
	hotelCategoryName: {
		type: String,
		default: ''
	},
	hotelStarCount: {
		type: Number,
		default: 0
	},
	mealType: {
		type: String,
		default: ''
	},
	isOpen: {
		type: Boolean,
		default: false
	}
});
</script>

<template>
	<div
			:class="[
			'product-marker-details info flex min-w-0 flex-col justify-start gap-2',
			isOpen ? 'product-marker-details--open open text-[16px]' : 'product-marker-details--closed text-[0px]'
		]"
	>
		<ProductLocation :value="hotel.locationSummary" variant="marker"/>

		<h3 class="product-marker-details__name name m-0 wrap-break-word text-[16px] font-semibold leading-[1.16]">
			{{ hotel.name }}</h3>

		<ProductRatingStars v-if="hotelStarCount" :count="hotelStarCount" variant="marker"/>
		<span v-else class="product-marker-details__category-name category-name text-coral-main-yellow">{{
				hotelCategoryName
			}}</span>

		<ul class="product-marker-details__terms terms hidden">
			<li v-if="offer.flight" class="product-marker-details__term product-marker-details__term--departure departure">из
				{{ $cityGenitiveCase(selectedDepartureName) }}
			</li>
			<li class="product-marker-details__term product-marker-details__term--begin-date begin-date">{{ beginDate }}</li>
			<li class="product-marker-details__term product-marker-details__term--stay-nights stay-nights">{{
					offer.stayNights
				}} {{ offer.stayNights.asNights() }}
			</li>
			<li class="product-marker-details__term product-marker-details__term--meal-type meal-type">{{ mealType }}</li>
		</ul>
	</div>
</template>
