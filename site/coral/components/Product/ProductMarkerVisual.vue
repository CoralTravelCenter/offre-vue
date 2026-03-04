<script setup>
import {computed} from "vue";

const props = defineProps({
	hotel: {
		type: Object,
		required: true
	},
	isOpen: {
		type: Boolean,
		default: false
	}
});

const imageUrl = computed(() => {
	const sizes = props.hotel?.images?.[0]?.sizes ?? [];
	return sizes.find((size) => size.type === 4)?.url ?? sizes[0]?.url ?? '';
});
</script>

<template>
	<img
		:class="[
			'product-marker-visual visual h-full w-full shrink-0 rounded-[12px] object-cover',
			props.isOpen ? 'product-marker-visual--open open' : ''
		]"
		:src="imageUrl"
		alt=""
	>
</template>
