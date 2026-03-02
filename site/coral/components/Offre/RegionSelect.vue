<script setup>
import {computed, nextTick, onMounted, onUnmounted, ref, watch} from "vue";
import {Skeleton} from "app/components/ui/skeleton";

const props = defineProps({
	modelValue: [String, Number],
	wildcardOption: [Boolean, String],
	loading: {
		type: Boolean,
		default: false
	},
	optionsList: {
		type: Array,
		default: () => []
	}
});

const emit = defineEmits(['update:modelValue']);
const scroller = ref();
const hasLeftFade = ref(false);
const hasRightFade = ref(false);
const hasInitialScrollSync = ref(false);

const selectedValue = computed(() => {
	return props.modelValue == null ? undefined : String(props.modelValue);
});

const availableValues = computed(() => {
	const values = props.optionsList.map((option) => String(option));
	if (props.wildcardOption) {
		return ['*', ...values];
	}
	return values;
});

function tidyLabel(value) {
	return String(value ?? '').replace(/\s*\(.+?\)/, '');
}

function syncScrollFade() {
	const element = scroller.value;
	if (!element) {
		hasLeftFade.value = false;
		hasRightFade.value = false;
		return;
	}

	const maxScrollLeft = element.scrollWidth - element.clientWidth;
	if (maxScrollLeft <= 1) {
		hasLeftFade.value = false;
		hasRightFade.value = false;
		return;
	}

	hasLeftFade.value = element.scrollLeft > 1;
	hasRightFade.value = element.scrollLeft < maxScrollLeft - 1;
}

async function selectOption(value) {
	const nextValue = String(value);
	emit('update:modelValue', nextValue);
}

function scrollToValue(value, behavior = "smooth") {
	const container = scroller.value;
	if (!value || !container) {
		return;
	}
	const activeItem = [...container.children]
			.find((element) => element.dataset.value === value);
	if (!activeItem) {
		requestAnimationFrame(syncScrollFade);
		return;
	}

	const style = window.getComputedStyle(container);
	const scrollPaddingStart = Number.parseFloat(style.scrollPaddingInlineStart || style.scrollPaddingLeft || '0');
	const paddingStart = Number.parseFloat(style.paddingLeft || '0');
	const inlineStartOffset = Number.isFinite(scrollPaddingStart) ? scrollPaddingStart : (Number.isFinite(paddingStart) ? paddingStart : 0);

	const currentLeft = container.scrollLeft;
	const nextLeft = Math.max(0, activeItem.offsetLeft - inlineStartOffset);

	if (Math.abs(nextLeft - currentLeft) > 1) {
		container.scrollTo({left: Math.max(0, nextLeft), behavior});
	}
	requestAnimationFrame(syncScrollFade);
}

	watch(
			[selectedValue, availableValues],
			async ([value, values]) => {
			if (!value || !values.includes(value)) {
				requestAnimationFrame(syncScrollFade);
				return;
				}
				await nextTick();
				scrollToValue(value, hasInitialScrollSync.value ? 'smooth' : 'auto');
				hasInitialScrollSync.value = true;
			},
			{immediate: true}
	);

onMounted(() => {
	syncScrollFade();
	window.addEventListener('resize', syncScrollFade);
});

onUnmounted(() => {
	window.removeEventListener('resize', syncScrollFade);
});

</script>

<template>
	<div class="region-select-shell" :class="{ 'has-left-fade': hasLeftFade, 'has-right-fade': hasRightFade }">
		<div v-if="loading" class="region-select-skeleton" aria-hidden="true">
			<Skeleton class="region-select-skeleton__item region-select-skeleton__item--active"/>
			<Skeleton class="region-select-skeleton__item"/>
			<Skeleton class="region-select-skeleton__item"/>
			<Skeleton class="region-select-skeleton__item"/>
		</div>

		<ul v-else ref="scroller" class="region-select" @scroll.passive="syncScrollFade">
			<li
					class="region-select__item"
					v-if="wildcardOption"
					data-value="*"
					:class="{ selected: selectedValue === '*' }"
					@click="selectOption('*')"
			>
				{{ tidyLabel(wildcardOption) }}
			</li>
			<li
					class="region-select__item"
					v-for="option in optionsList"
					:key="option"
					:data-value="String(option)"
					:class="{ selected: selectedValue === String(option) }"
					@click="selectOption(option)"
			>
				{{ tidyLabel(option) }}
			</li>
		</ul>
	</div>
</template>

<style scoped lang="less">
@import "../../common/css/coral-colors";

.region-select-shell {
	position: relative;
	min-width: 0;
	margin-top: 8px;

	&::before,
	&::after {
		content: "";
		position: absolute;
		top: 0;
		bottom: 0;
		width: 20%;
		pointer-events: none;
		opacity: 0;
		transition: opacity 0.2s ease;
		z-index: 1;
	}

	&::after {
		right: 0;
		background: linear-gradient(to left, #FFFFFF 0%, rgba(234, 243, 251, 0) 100%);
	}

	&.has-left-fade::before {
		opacity: 1;
	}

	&.has-right-fade::after {
		opacity: 1;
	}
}

.region-select {
	display: flex;
	align-items: center;
	list-style: none;
	margin: 0;
	padding: 0 8px;
	overflow-x: scroll;
	scroll-snap-type: x mandatory;
	scrollbar-width: none;
	-ms-overflow-style: none;
	scroll-padding-inline: 8px;

	&::-webkit-scrollbar {
		display: none;
	}
}

.region-select__item {
	padding: 12px 20px;
	border-radius: 24px;
	font-size: 14px;
	cursor: pointer;
	scroll-snap-align: start;
	flex: 0 0 auto;

	&.selected {
		color: white;
		background-color: @coral-main-blue;
	}
}

.region-select-skeleton {
	display: flex;
	align-items: center;
	gap: 8px;
	padding: 0 8px;
	overflow: hidden;
}

.region-select-skeleton__item {
	display: inline-block;
	height: 38px;
	width: 124px;
	border-radius: 24px;
}

.region-select-skeleton__item--active {
	width: 160px;
}
</style>
