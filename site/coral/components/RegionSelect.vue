<script setup>
import {useMouseInElement, useResizeObserver, useScroll} from "@vueuse/core";
import {inject, ref, watchEffect} from "vue";

const props = defineProps({
	modelValue: String,
	wildcardOption: String,
	optionsList: Array
});

const $el = ref();

const emit = defineEmits(['update:modelValue']);

const layoutMode = inject('layout-mode');

function selectOptionEl(el) {
	el.classList.add('selected');
	[...el.parentNode.children].filter(n => n !== el).forEach(n => n.classList.remove('selected'));
	emit('update:modelValue', el.dataset.value);
}

watchEffect(() => {
	const li = $el.value?.querySelector(`li[data-value="${props.modelValue}"]`);
	if (li) selectOptionEl(li);
}, {flush: 'post'});

const vTidy = {
	mounted(el) {
		el.textContent = el.textContent.replace(/\s*\(.+?\)/, '');
	}
}

const scroller = ref();
const {elementX: mouse_x, isOutside: mouseOut} = useMouseInElement(scroller);
useResizeObserver(scroller, (entries) => {

});
const {x: scroll_x} = useScroll(scroller, {behavior: 'auto'});

watchEffect(() => {
	if (layoutMode.value === 'desktop' && scroller.value) {
		const li = [...scroller.value.children];
		if (li.length) {
			const left_gap = li.at(0).clientWidth;
			const rightGap = li.at(-1).clientWidth;
			const hover_area_width = scroller.value.clientWidth - left_gap - rightGap;
			let target_scroll_ratio = (mouse_x.value - left_gap) / hover_area_width;
			if (target_scroll_ratio < 0) target_scroll_ratio = 0.0;
			if (target_scroll_ratio > 1) target_scroll_ratio = 1.0;
			const scroll_span = scroller.value.scrollWidth - scroller.value.clientWidth;
			scroll_x.value = Math.round(scroll_span * target_scroll_ratio);
		}
	}
});

function scrollRegions(direction) {
	if (!scroller.value) return;
	const delta = Math.round(scroller.value.clientWidth * 0.6) * direction;
	scroller.value.scrollBy({left: delta, behavior: 'smooth'});
}

</script>

<template>
	<div class="region-select" ref="$el">
		<ul ref="scroller">
			<li v-if="wildcardOption" data-value="*" @click="modelValue='*'" v-tidy>{{ wildcardOption }}</li>
			<li v-for="option in optionsList" :data-value="option" @click="modelValue=option" v-tidy>{{ option }}</li>
		</ul>
	</div>
</template>

<style scoped lang="less">
@import "../common/css/coral-colors";
@import "../common/css/layout";

.region-select {
	flex: 1 1 auto;
	position: relative;
	@media screen and (max-width: @mobile-breakpoint) {
		grid-column: 1 / span 2;
		padding-right: 0;
	}
	@media screen and (max-width: @narrow-breakpoint) {
		grid-column: 1;
	}

	.nav {
		position: absolute;
		right: .4em;
		top: 50%;
		transform: translateY(-50%);
		display: flex;
		gap: .4em;
		z-index: 2;
	}

	.nav-btn {
		.interactive();
		width: 2.4em;
		height: 2.4em;
		border-radius: .6em;
		border: 1px solid fade(black, 10%);
		background: white;
		color: fade(black, 70%);
		display: inline-grid;
		place-items: center;
		font-size: 1.1em;
		line-height: 1;
		cursor: pointer;
		box-shadow: 0 1px 2px fade(black, 10%);
	}

	ul {
		display: flex;
		align-items: center;
		list-style: none;
		padding: 0;
		margin: 0;
		overflow-x: scroll;
		scroll-snap-type: x mandatory;

		&::-webkit-scrollbar {
			display: none;
		}

		> li {
			padding: 12px 20px;
			border-radius: 24px;
			cursor: pointer;
			scroll-snap-align: start;

			&.selected {
				color: white;
				background-color: @coral-main-blue;
			}
		}
	}
}
</style>
