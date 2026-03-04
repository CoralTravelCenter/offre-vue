<script setup>
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
	}
});
</script>

<template>
	<div class="product-rating">
		<span v-for="n in count" :key="`star-filled-${variant}-${n}`" class="filled"></span>
		<span v-for="n in (max - count)" :key="`star-empty-${variant}-${n}`" class="empty"></span>
	</div>
</template>

<style scoped lang="less">
.product-rating {
	display: flex;
	gap: 4px;

	> span {
		background: center / cover no-repeat;
		width: 20px;
		height: 20px;

		&.filled {
			background-image: url(data-url:/site/coral/assets-inline/rating-star-filled.svg);
		}

		&.empty {
			background-image: url(data-url:/site/coral/assets-inline/rating-star-empty.svg);
		}
	}
}
</style>
