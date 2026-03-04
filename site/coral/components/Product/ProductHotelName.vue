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
	<a :href="offerHref" target="_blank" :class="linkClass">
		<h3 :class="titleClass">{{ name }}</h3>
	</a>
</template>
