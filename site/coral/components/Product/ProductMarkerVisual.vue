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
	<img class="visual" :class="{ open: props.isOpen }" :src="imageUrl" alt="">
</template>

<style scoped lang="less">
@import "../../common/css/layout";

.visual {
	width: 100%;
	height: 100%;
	object-fit: cover;
	flex-shrink: 0;
	border-radius: 12px;
}
</style>
