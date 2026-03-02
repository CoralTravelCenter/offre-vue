<script setup>
const emit = defineEmits(['retry-products']);

defineProps({
	initialLoading: {
		type: Boolean,
		default: false
	},
	productsLoading: {
		type: Number,
		default: 0
	},
	noMatchedProducts: {
		type: Boolean,
		default: false
	},
	productsError: {
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

function retryProducts() {
	emit('retry-products');
}
</script>

<template>
	<div v-if="!productsLoading && productsError" class="message-hint products-error">
		<div class="icon warning"></div>
		<div class="reason">Не удалось загрузить варианты туров.</div>
		<div class="hint">
			Проверьте подключение к сети или повторите попытку чуть позже.
			<button type="button" class="retry-action" @click="retryProducts">Повторить</button>
		</div>
	</div>

	<div v-else-if="!productsLoading && noMatchedProducts && selectedRegion" class="message-hint no-matched-products">
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
	grid-template: auto auto / min-content auto;
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
		align-self: end;
		line-height: 1;
	}

	.hint {
		grid-area: 2 / 2;
		font-weight: 300;
		align-self: start;
		line-height: 1;
	}
}

.icon {
	width: 44px;
	height: 44px;
	background: center / cover no-repeat;

	&.warning {
		background-image: url("data-url:/site/coral/assets-inline/icon-warning.svg");
	}

	&.info {
		background-image: url("data-url:/site/coral/assets-inline/icon-info.svg");
	}
}

.retry-action {
	margin-left: 8px;
	padding: 2px 8px;
	font-size: 12px;
	line-height: 1.2;
	color: #0092D0;
	border: 1px solid fade(#0092D0, 35%);
	border-radius: 6px;
	background: #FFFFFF;
	cursor: pointer;
}
</style>
