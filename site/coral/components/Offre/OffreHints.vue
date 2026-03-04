<script setup>
import {computed} from "vue";
import {Button} from "app/components/ui/button";

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
	<div v-if="!isRequestLoading && isRequestError" class="message-hint products-error">
		<div class="icon warning"></div>
		<div class="reason">Не удалось загрузить варианты туров.</div>
		<div class="hint">Проверьте подключение к сети или повторите попытку чуть позже.</div>
		<Button
				type="button"
				variant="outline"
				size="sm"
				class="retry-action !h-8 !rounded-[8px] !border-[#0092D0]/35 !bg-white !text-[#0092D0] hover:!border-[#0092D0] hover:!bg-white hover:!text-[#0092D0]"
				@click="retryProducts"
		>
			Повторить
		</Button>
	</div>

	<!-- Empty result state for current filters -->
	<div v-else-if="!isRequestLoading && isRequestEmpty && selectedRegion" class="message-hint no-matched-products">
		<div class="icon warning"></div>
		<div class="reason">Из {{ $cityGenitiveCase(selectedDeparture.name) }} в данной подборке отелей нет подходящих
			вариантов.
		</div>
		<div class="hint">Пожалуйста, попробуйте поменять условия выбора &mdash; регион / город вылета / период
			путешествия
		</div>
	</div>

</template>

<style scoped lang="less">
@import "../../common/css/layout";
@import "../../common/css/coral-colors";

.message-hint {
	display: grid;
	grid-template-columns: min-content auto;
	grid-template-rows: auto auto auto;
	gap: 8px;
	padding: 16px;
	border-radius: 16px;

	&.no-matched-products {
		background: fade(@coral-main-yellow, 5%);
	}

	&.products-error {
		background: fade(@coral-red-error, 5%);
	}

	&.initial-loading {
		background: fade(@coral-main-blue, 5%);
	}

	.icon {
		grid-area: 1 / 1 / -1 / 2;
		justify-self: center;
		align-self: center;
	}

	.reason {
		grid-area: 1 / 2;
		font-weight: 600;
		font-size: 16px;
		align-self: end;
		line-height: 1;
	}

	.hint {
		grid-area: 2 / 2;
		font-weight: 300;
		font-size: 14px;
		align-self: start;
		line-height: 1;
	}

	.retry-action {
		grid-area: 3 / 2;
		justify-self: start;
	}
}

.icon {
	width: 40px;
	height: 40px;
	background: center / contain no-repeat;

	&.warning {
		background-image: url("data-url:/site/coral/assets-inline/icon-warning.svg");
	}

	&.info {
		background-image: url("data-url:/site/coral/assets-inline/icon-info.svg");
	}
}

</style>
