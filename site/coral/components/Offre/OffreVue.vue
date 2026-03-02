<script setup>

import {computed, onMounted, provide, ref, unref} from "vue";
import {useMediaQuery, useScriptTag, useUrlSearchParams} from "@vueuse/core";
import dayjs from "dayjs";
import locale_ru from "dayjs/locale/ru";
import ProductGrid from "../Product";
import ProductCardSkeleton from "../Product/ProductCardSkeleton.vue";
import OffreControls from "./OffreControls.vue";
import OffreHints from "./OffreHints.vue";
import {v4 as uuid_v4} from "uuid";
import {VueYandexMaps} from "vue-yandex-maps";
import {useOffreLayout} from "../../composables/useOffreLayout";
import {useOffreFilters} from "../../composables/useOffreFilters";
import {useOffreProducts} from "../../composables/useOffreProducts";

dayjs.locale(locale_ru);

const instance_uuid = uuid_v4();

const props = defineProps({
	options: {
		type: Object,
		default: {groupBy: 'countries', chartersOnly: true}
	},
	hotelsList: {type: Array, default: []}
});

provide('widget-options', props.options);
provide('widget-hotels-list', props.hotelsList);

const $el = ref();
const calcCashbackFn = ref(() => {
});
useScriptTag('https://b2ccdn.coral.ru/content/scripts/getbonus.js', () => {
	calcCashbackFn.value = window._get_CBonuses;
});
provide('calc-cashback', {calcCashbackFn});

const {layoutMode} = useOffreLayout();
provide('layout-mode', layoutMode);
const {
	regionOptions,
	regionsLoading,
	selectedRegion,
	selectedTimeframe,
	timeframeOptions,
	isTimeframeSelectable,
	hotelInfos,
	matchedHotelsDirectory,
	departures,
	selectedDeparture,
	selectedDepartureId
} = useOffreFilters({props, rootEl: $el});
provide('selected-departure', selectedDeparture);
const productsReloadToken = ref(0);

const {
	initialLoading,
	productsLoading,
	productsList,
	productReference,
	noMatchedProducts,
	productsError,
	clickedLocationHotelId,
	getReferenceValueByKey
} = useOffreProducts({
	props,
	matchedHotelsDirectory,
	selectedTimeframe,
	hotelInfos,
	selectedDeparture,
	regionsLoading,
	reloadToken: productsReloadToken
});

function retryProductsFetch() {
	productsReloadToken.value += 1;
}
provide('product-reference', {productReference, getReferenceValueByKey});
provide('clicked-location-hotel-id', clickedLocationHotelId);

const isLargeScreen = useMediaQuery('(min-width: 993px)')
const searchParams = useUrlSearchParams('history')
const isMvMode = computed(() => {
	const raw = searchParams.mv
	const value = Array.isArray(raw) ? raw[0] : raw
	return String(value).toLowerCase() === 'true'
})
const controlsStickyOptions = computed(() => ({
	top: isMvMode.value ? 100 : (isLargeScreen.value ? 16 : 74),
	bottom: 16,
	side: 'both',
	zIndex: 20
}))

const gridViewMode = ref('list');
provide('grid-view-mode', gridViewMode);

const isMapReady = computed(() => Boolean(unref(VueYandexMaps.isReadyToInit)));

const showProductSkeleton = computed(() => {
	return initialLoading.value || (productsLoading.value > 0 && productsList.length === 0);
});

onMounted(() => {
	window.OffreVue ||= {version: '1.0.0'};
});

</script>

<template>
	<div class="offre-vue" ref="$el" :data-instance-uuid="instance_uuid">
		<div
				class="controls-sticky overflow-clip pb-2 rounded-2xl border border-[rgba(0,0,0,0.15)] data-[sticky=true]:shadow-md bg-white"
				v-sticky="controlsStickyOptions"
		>
			<OffreControls
					:selected-region="selectedRegion"
					:region-options="regionOptions"
					:regions-loading="regionsLoading"
					:wildcard-option="options.wildcardOption"
					:selected-departure-id="selectedDepartureId"
					:departures="departures"
					:selected-timeframe="selectedTimeframe"
					:timeframe-options="timeframeOptions"
						:is-timeframe-selectable="isTimeframeSelectable"
						:grid-view-mode="gridViewMode"
						:is-map-ready="isMapReady"
						@update:selected-region="selectedRegion = $event"
					@update:selected-departure-id="selectedDepartureId = $event"
					@update:selected-timeframe="selectedTimeframe = $event"
					@update:grid-view-mode="gridViewMode = $event"
					@request-map-mode="clickedLocationHotelId = null"
			/>
		</div>

		<OffreHints
				:initial-loading="initialLoading"
				:products-loading="productsLoading"
				:no-matched-products="noMatchedProducts"
				:products-error="productsError"
				:selected-region="selectedRegion"
				:selected-departure="selectedDeparture"
				@retry-products="retryProductsFetch"
		/>

		<div v-if="showProductSkeleton" class="product-skeleton-list" aria-hidden="true">
			<ProductCardSkeleton/>
			<ProductCardSkeleton/>
		</div>

		<ProductGrid :products="productsList" :in-progress="productsLoading"
								 :view-mode="gridViewMode"></ProductGrid>
	</div>
</template>

<style lang="less">
@import "../../common/css/coral-colors";
@import "../../common/css/layout";

:root {
	--el-font-family: inherit !important;
	--el-fill-color-light: fade(@coral-main-blue, 8%) !important;
	--el-color-primary: @coral-main-blue;
}

.el-progress-bar {
	font-family: inherit;
	--el-color-primary: @coral-main-blue;
}

.offre-vue {
	.el-button-group {
		display: flex;
		justify-content: end;
		gap: 8px;

		&:after, &:before {
			display: none;
		}
	}
}

.offre-vue {
	width: 100%;
	margin: 0;
	padding: 0;
	.bbox();
	font-size: 16px;
	font-weight: normal;
	display: flex;
	flex-direction: column;
	gap: 16px;
}

.product-skeleton-list {
	display: grid;
	gap: 8px;
}
</style>
