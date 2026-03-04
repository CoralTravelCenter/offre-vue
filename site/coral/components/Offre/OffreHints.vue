<script setup>
import {computed} from "vue";
import {Button} from "app/components/ui/button";
import iconWarning from 'data-url:/site/coral/assets-inline/icon-warning.svg';

const emit = defineEmits(['retry-products']);

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

function retryProducts() {
	emit('retry-products');
}
</script>

<template>
	<!-- API/network error state -->
	<div
		v-if="!isRequestLoading && isRequestError"
		class="offre-hints__message message-hint offre-hints__message--error grid grid-cols-[min-content_auto] grid-rows-[auto_auto_auto] gap-2 rounded-2xl bg-destructive/5 p-4"
	>
		<img class="offre-hints__icon offre-hints__icon--warning h-10 w-10 place-self-center object-contain [grid-area:1/1/-1/2]" :src="iconWarning" alt="" aria-hidden="true">
		<div class="offre-hints__reason self-end text-[16px] font-semibold leading-none [grid-area:1/2]">Не удалось загрузить варианты туров.</div>
		<div class="offre-hints__hint self-start text-[14px] font-light leading-none [grid-area:2/2]">Проверьте подключение к сети или повторите попытку чуть позже.</div>
		<Button
			type="button"
			variant="outline"
			size="sm"
			class="offre-hints__retry retry-action [grid-area:3/2] justify-self-start !h-8 !rounded-[8px] !border-primary/35 !bg-white !text-primary hover:!border-primary hover:!bg-white hover:!text-primary"
			@click="retryProducts"
		>
			Повторить
		</Button>
	</div>

	<!-- Empty result state for current filters -->
	<div
		v-else-if="!isRequestLoading && isRequestEmpty && selectedRegion"
		class="offre-hints__message message-hint offre-hints__message--empty grid grid-cols-[min-content_auto] grid-rows-[auto_auto_auto] gap-2 rounded-2xl bg-coral-main-yellow/5 p-4"
	>
		<img class="offre-hints__icon offre-hints__icon--warning h-10 w-10 place-self-center object-contain [grid-area:1/1/-1/2]" :src="iconWarning" alt="" aria-hidden="true">
		<div class="offre-hints__reason self-end text-[16px] font-semibold leading-none [grid-area:1/2]">Из {{ $cityGenitiveCase(selectedDeparture.name) }} в данной подборке отелей нет подходящих
			вариантов.
		</div>
		<div class="offre-hints__hint self-start text-[14px] font-light leading-none [grid-area:2/2]">Пожалуйста, попробуйте поменять условия выбора &mdash; регион / город вылета / период
			путешествия
		</div>
	</div>

</template>
