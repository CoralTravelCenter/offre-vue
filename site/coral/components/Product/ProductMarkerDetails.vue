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
	<div class="info" :class="{ open: isOpen }">
		<ProductLocation :value="hotel.locationSummary" variant="marker"/>

		<h3 class="name">{{ hotel.name }}</h3>

		<ProductRatingStars v-if="hotelStarCount" :count="hotelStarCount" variant="marker"/>
		<span v-else class="category-name">{{ hotelCategoryName }}</span>

		<ul class="terms">
			<li v-if="offer.flight" class="departure">из {{ $cityGenitiveCase(selectedDepartureName) }}</li>
			<li class="begin-date">{{ beginDate }}</li>
			<li class="stay-nights">{{ offer.stayNights }} {{ offer.stayNights.asNights() }}</li>
			<li class="meal-type">{{ mealType }}</li>
		</ul>
	</div>
</template>

<style scoped lang="less">
@import "../../common/css/layout";
@import "../../common/css/coral-colors";

.info {
	display: flex;
	flex-direction: column;
	justify-content: flex-start;
	gap: 8px;
	min-width: 0;

	&.open {
		font-size: 16px;
	}

	&:not(.open) {
		font-size: 0;
	}
}

.info .name {
	font-size: 16px;
	line-height: 1.16;
	margin: 0;
	font-weight: 600;
	word-break: break-word;
}

.info .category-name {
	color: @coral-main-yellow;
}

.info ul.terms {
	display: none;
}
</style>
