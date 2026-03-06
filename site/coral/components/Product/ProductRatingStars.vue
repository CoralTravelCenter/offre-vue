<script setup>
import filledStarIcon from 'data-url:/site/coral/assets-inline/rating-star-filled.svg';
import emptyStarIcon from 'data-url:/site/coral/assets-inline/rating-star-empty.svg';

const props = defineProps({
	count: {
		type: Number,
		default: 0
	},
	max: {
		type: Number,
		default: 5
	},
	variant: {
		type: String,
		default: 'card'
	},
	starClass: {
		type: String,
		default: 'h-5 w-5'
	}
});
</script>

<template>
		<div class="product-rating product-rating--stars inline-flex gap-1">
			<img
				v-for="n in count"
				:key="`star-filled-${variant}-${n}`"
				:class="['product-rating__star product-rating__star--filled block object-cover', starClass]"
				:src="filledStarIcon"
				alt=""
				aria-hidden="true"
			>
			<img
				v-for="n in (max - count)"
				:key="`star-empty-${variant}-${n}`"
				:class="['product-rating__star product-rating__star--empty block object-cover', starClass]"
				:src="emptyStarIcon"
				alt=""
				aria-hidden="true"
			>
		</div>
</template>
