<script setup>
defineProps({
	offerHref: {
		type: String,
		required: true
	},
	name: {
		type: String,
		default: ''
	},
	linkClass: {
		type: String,
		default: 'hotel-name'
	},
	titleClass: {
		type: String,
		default: 'name'
	}
});
</script>

<template>
		<a
			:href="offerHref"
			target="_blank"
			:class="['product-hotel-name__link inline-block text-inherit no-underline min-[1280px]:mt-2 min-[1280px]:mb-2', linkClass]"
		>
			<h3 :class="['product-hotel-name__title m-0', titleClass]">{{ name }}</h3>
		</a>
</template>
