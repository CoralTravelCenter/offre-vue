<script setup>
import {computed} from "vue";

const props = defineProps({
	requestState: {
		type: String,
		default: 'idle'
	},
	noMatchedProducts: {
		type: Boolean,
		default: false
	},
	selectedRegion: {
		type: [String, Number],
		default: undefined
	},
	selectedDeparture: {
		type: Object,
		default: () => ({})
	}
});

const isRequestLoading = computed(() => props.requestState === 'loading');
const isRequestError = computed(() => props.requestState === 'error');
const isRequestEmpty = computed(() => props.requestState === 'success' && props.noMatchedProducts);
const departureName = computed(() => props.selectedDeparture?.name || 'Москва');
</script>

<template>
	<!-- API/network error state -->
	<div
			v-if="!isRequestLoading && isRequestError"
			class="offre-hints__message message-hint offre-hints__message--error grid grid-cols-[min-content_auto] grid-rows-[auto_auto] gap-2 rounded-2xl border border-[#FFB8BF] bg-[var(--coral-red-warn)] p-4"
	>
		<svg
				class="offre-hints__icon offre-hints__icon--warning h-7 w-7 shrink-0 text-[#FF3333] [grid-area:1/1/3/2] self-center"
				viewBox="64 64 896 896" focusable="false" data-icon="exclamation-circle" fill="currentColor" aria-hidden="true">
			<path
					d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm-32 232c0-4.4 3.6-8 8-8h48c4.4 0 8 3.6 8 8v272c0 4.4-3.6 8-8 8h-48c-4.4 0-8-3.6-8-8V296zm32 440a48.01 48.01 0 010-96 48.01 48.01 0 010 96z"></path>
		</svg>
		<div class="offre-hints__reason self-center text-[16px] font-semibold leading-none [grid-area:1/2]">Не удалось
			загрузить варианты туров.
		</div>
		<div class="offre-hints__hint self-start text-[14px] font-light leading-none [grid-area:2/2]">Проверьте подключение
			к сети или повторите попытку чуть позже.
		</div>
	</div>

	<!-- Empty result state for current filters -->
	<div
			v-else-if="!isRequestLoading && isRequestEmpty && selectedRegion"
			class="offre-hints__message message-hint offre-hints__message--empty grid grid-cols-[min-content_auto] grid-rows-[auto_auto] gap-2 rounded-2xl border border-[#FCDF9C] bg-[#FDF7E6] p-4"
	>
		<svg
				class="offre-hints__icon offre-hints__icon--warning h-7 w-7 shrink-0 text-[#D48806] [grid-area:1/1/3/2] self-center"
				viewBox="64 64 896 896" focusable="false" data-icon="exclamation-circle" fill="currentColor" aria-hidden="true">
			<path
					d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm-32 232c0-4.4 3.6-8 8-8h48c4.4 0 8 3.6 8 8v272c0 4.4-3.6 8-8 8h-48c-4.4 0-8-3.6-8-8V296zm32 440a48.01 48.01 0 010-96 48.01 48.01 0 010 96z"></path>
		</svg>
		<div class="offre-hints__reason self-center text-[16px] font-semibold leading-none [grid-area:1/2]">Из
			{{ $cityGenitiveCase(departureName) }} в данной подборке отелей нет подходящих
			вариантов.
		</div>
		<div class="offre-hints__hint self-start text-[14px] font-light leading-none [grid-area:2/2]">Пожалуйста, попробуйте
			поменять условия выбора &mdash; регион / город вылета / период
			путешествия
		</div>
	</div>

</template>
