<script setup>
import {computed, nextTick, onMounted, onUnmounted, ref, watch} from "vue";
import {Skeleton} from "app/components/ui/skeleton";

const model = defineModel({
	type: [String, Number],
	default: undefined
});

const props = defineProps({
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

const scroller = ref();
const hasLeftFade = ref(false);
const hasRightFade = ref(false);
const hasInitialScrollSync = ref(false);

const selectedValue = computed(() => {
	return model.value == null ? undefined : String(model.value);
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
	model.value = nextValue;
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
	<div
		class="region-select-shell relative mt-2 min-w-0 before:pointer-events-none before:absolute before:inset-y-0 before:left-0 before:z-[1] before:w-1/5 before:opacity-0 before:transition-opacity before:duration-200 before:ease-in-out before:content-[''] before:bg-[linear-gradient(to_right,var(--coral-page-bg)_0%,rgba(234,243,251,0)_100%)] after:pointer-events-none after:absolute after:inset-y-0 after:right-0 after:z-[1] after:w-1/5 after:opacity-0 after:transition-opacity after:duration-200 after:ease-in-out after:content-[''] after:bg-[linear-gradient(to_left,var(--coral-page-bg)_0%,rgba(234,243,251,0)_100%)] lg:mt-0"
		:class="{ 'before:opacity-100': hasLeftFade, 'after:opacity-100': hasRightFade }"
	>
		<div
			v-if="loading"
			class="region-select-skeleton region-select-skeleton--loading flex items-center gap-2 overflow-hidden px-2"
			aria-hidden="true"
		>
			<Skeleton class="region-select-skeleton__item region-select-skeleton__item--active block h-[38px] min-w-0 flex-[1_1_0] rounded-[24px]"/>
			<Skeleton class="region-select-skeleton__item block h-[38px] min-w-0 flex-[1_1_0] rounded-[24px]"/>
			<Skeleton class="region-select-skeleton__item block h-[38px] min-w-0 flex-[1_1_0] rounded-[24px]"/>
			<Skeleton class="region-select-skeleton__item block h-[38px] min-w-0 flex-[1_1_0] rounded-[24px]"/>
		</div>

		<ul
			v-else
			ref="scroller"
			class="region-select region-select__list m-0 flex list-none items-center overflow-x-scroll px-2 [scroll-padding-inline:8px] [scrollbar-width:none] [-ms-overflow-style:none] snap-x snap-mandatory [&::-webkit-scrollbar]:hidden"
			@scroll.passive="syncScrollFade"
		>
			<li
				v-if="wildcardOption"
				class="region-select__item region-select__item--option shrink-0 cursor-pointer rounded-[24px] px-5 py-3 text-[14px] snap-start"
				data-value="*"
				:class="{ 'region-select__item--selected bg-primary text-primary-foreground': selectedValue === '*' }"
				@click="selectOption('*')"
			>
				{{ tidyLabel(wildcardOption) }}
			</li>
			<li
				v-for="option in optionsList"
				:key="option"
				class="region-select__item region-select__item--option shrink-0 cursor-pointer rounded-[24px] px-5 py-3 text-[14px] snap-start"
				:data-value="String(option)"
				:class="{ 'region-select__item--selected bg-primary text-primary-foreground': selectedValue === String(option) }"
				@click="selectOption(option)"
			>
				{{ tidyLabel(option) }}
			</li>
		</ul>
	</div>
</template>
