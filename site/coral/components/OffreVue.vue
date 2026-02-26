<script setup>

import {computed, getCurrentInstance, onMounted, provide, reactive, ref, watchEffect} from "vue";
import RegionSelect from "./RegionSelect.vue";
import {HotelContent, OnlyHotelProduct, PackageTourHotelProduct} from "../../lib/b2c-api";
import {hotelCommonSearchCriterias, packageCommonSearchCriterias} from "../config/globals";
import {additionalFiltersWithTerms, hotelSearchTimeframes} from "../../lib/data-ops";
import {useScriptTag} from "@vueuse/core/index";

import dayjs from "dayjs";
import locale_ru from 'dayjs/locale/ru'
import hash from "object-hash";
import ProductGrid from "./ProductGrid.vue";
import {merge, omit} from 'lodash';
import {invoke, until, useElementVisibility, useEventListener} from "@vueuse/core";
import {v4 as uuid_v4} from 'uuid';

import {VueYandexMaps} from "vue-yandex-maps";

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
// useScriptTag('https://b2ccdn.coral.ru/content/scripts/getbonus.txt', () => {
useScriptTag('https://b2ccdn.coral.ru/content/scripts/getbonus.js', () => {
	calcCashbackFn.value = window._get_CBonuses;
});
provide('calc-cashback', {calcCashbackFn});

const layoutMode = ref('');
provide('layout-mode', layoutMode);
onMounted(() => {
	const layout = matchMedia('(max-width:768px)');
	layout.addEventListener('change', e => layoutMode.value = e.matches ? 'mobile' : 'desktop');
	layoutMode.value = layout.matches ? 'mobile' : 'desktop';
});

const controlsAffixOffset = ref(0);
onMounted(() => {
	const small_layout = matchMedia('(max-width: 768px)');
	small_layout.addEventListener('change', e => {
		if (e.matches) controlsAffixOffset.value = 54;
	});
	if (small_layout.matches) controlsAffixOffset.value = 54;
	//
	const medium_layout = matchMedia('(min-width: 769px) and (max-width:992px)');
	medium_layout.addEventListener('change', e => {
		if (e.matches) controlsAffixOffset.value = 40;
	});
	if (medium_layout.matches) controlsAffixOffset.value = 40;
	//
	const wide_layout = matchMedia('(min-width: 993px)');
	wide_layout.addEventListener('change', e => {
		if (e.matches) controlsAffixOffset.value = 0;
	});
	if (wide_layout.matches) controlsAffixOffset.value = 0;
});

const hotelsDirectory = ref([]);
watchEffect(() => {
	hotelsDirectory.value = props.hotelsList.map(hotel => {
		const entry = {
			id: typeof hotel === 'number' ? hotel : hotel.id,
			timeframes: hotelSearchTimeframes(hotel, props.options),
		};
		if (hotel.onlyhotel) entry.onlyhotel = hotel.onlyhotel;
		return entry;
	});
	// console.log('+++ hotelsDirectory: %o', hotelsDirectory.value);
});


const regionOptions = ref([]);
const selectedRegion = ref();

const selectedTimeframe = ref();
const timeframeOptions = computed(() => {
	return [...(new Set(hotelsDirectory.value.map(entry => entry.timeframes.map(tf => tf.key)).flat(Infinity)))];
});
const isTimeframeSelectable = computed(() => {
	return timeframeOptions.value.length > 1;
});
watchEffect(() => {
	if (timeframeOptions.value.length) {
		selectedTimeframe.value = timeframeOptions.value[0];
	}
});

const hotelInfos = ref([]);
const regionsDirectory = ref({});

const isVisible = useElementVisibility($el);
const shownOnce = ref(false);

invoke(async () => {
	await until(isVisible).toBe(true);
	shownOnce.value = true;
});

watchEffect(async () => {
	if (shownOnce.value) {
		const hotel_ids = [...(new Set(props.hotelsList.map(hotel => typeof hotel === 'number' ? hotel : hotel.id)))];
		const {result: hotels_info} = await HotelContent.ListHotelsInfo(hotel_ids);
		const {hotels, countries, regions, areas, places} = hotels_info;
		hotelInfos.value = hotels;
		regionsDirectory.value = {countries, regions, areas, places};
		const location_options = hotels_info[props.options.groupBy];
		regionOptions.value = [...(new Set(Object.entries(location_options).map(([id, {name}]) => name)))];
		if (props.options.regionsOrder) {
			regionOptions.value.sort((a, b) => {
				let aidx = props.options.regionsOrder.indexOf(a);
				if (aidx < 0) aidx = Infinity;
				let bidx = props.options.regionsOrder.indexOf(b);
				if (bidx < 0) bidx = Infinity;
				return aidx - bidx;
			});
		}
		if (props.options.preferRegion) {
			selectedRegion.value = props.options.preferRegion;
		} else {
			selectedRegion.value = props.options.wildcardOption ? '*' : regionOptions.value[0];
		}
	}
});

const matchedHotelsDirectory = computed(() => {
	if (selectedRegion.value && selectedTimeframe.value && hotelInfos.value.length) {
		const region_key = {
			countries: 'countryKey',
			regions: 'regionKey',
			areas: 'areaKey',
			places: 'placeKey'
		}[props.options.groupBy];
		return hotelsDirectory.value.filter(hotel => {
			const hotel_info = hotelInfos.value.find(info => hotel.id == info.id);
			return !!hotel_info && (selectedRegion.value === '*'
							|| hotel_info[region_key] == [...Object.entries(regionsDirectory.value[props.options.groupBy])].find(([k, v]) => v.name === selectedRegion.value)[0])
					&& (!isTimeframeSelectable.value || hotel.timeframes.some(tf => tf.key === selectedTimeframe.value));
		});
	} else {
		return [];
	}
});

const offerQueryParams = ref([]);
const offerQueries = ref([]);

watchEffect((onCleanup) => {
	const searchFields_lut = {};
	for (const matchedHotel of matchedHotelsDirectory.value) {
		const id = matchedHotel.id;
		const {searchFields} = matchedHotel.timeframes.find(tf => tf.key === selectedTimeframe.value);
		// console.log('--- %o -> %o', id, searchFields);
		const terms_hash = hash({onlyhotel: matchedHotel.onlyhotel, searchFields});
		searchFields_lut[terms_hash] ||= {
			onlyhotel: matchedHotel.onlyhotel,
			termsSearchFields: JSON.parse(JSON.stringify(searchFields)),
			locationsSearchFields: new Set()
		};
		try {
			const {location} = hotelInfos.value.find(info => info.id == id);
			searchFields_lut[terms_hash].locationsSearchFields.add({id: location.id, type: location.type});
		} catch (ex) {
		}
	}
	// console.log(searchFields_lut);
	offerQueryParams.value = Object.values(searchFields_lut).map(terms_and_locations => {
		return terms_and_locations.onlyhotel ? Object.assign({}, hotelCommonSearchCriterias, {
			beginDates: terms_and_locations.termsSearchFields.beginDates,
			nights: terms_and_locations.termsSearchFields.nights.map(n => ({value: n})),
			arrivalLocations: [...terms_and_locations.locationsSearchFields],
			paging: {pageNumber: 1, pageSize: terms_and_locations.locationsSearchFields.size, sortType: 0},
			additionalFilters: additionalFiltersWithTerms(props.options)
		}) : Object.assign({}, packageCommonSearchCriterias, {
			beginDates: terms_and_locations.termsSearchFields.beginDates,
			nights: terms_and_locations.termsSearchFields.nights.map(n => ({value: n})),
			departureLocations: [selectedDeparture.value],
			arrivalLocations: [...terms_and_locations.locationsSearchFields],
			paging: {pageNumber: 1, pageSize: terms_and_locations.locationsSearchFields.size, sortType: 0},
			flightType: props.options.chartersOnly ? 0 : 2,
			additionalFilters: additionalFiltersWithTerms(props.options)
		});
	});
	// console.log('=== offerQueries: %o', offerQueryParams.value);
});

const initialLoading = ref(true);
const productsLoading = ref(0);
const productsList = reactive([]);
const productReference = ref({});
const noMatchedProducts = ref(false);

watchEffect(() => {
	offerQueries.value = offerQueryParams.value.map(queryParams => {
		return queryParams.departureLocations
				? PackageTourHotelProduct.PriceSearchList({searchCriterias: queryParams})
				: OnlyHotelProduct.PriceSearchList({searchCriterias: queryParams});
	});
	if (offerQueries.value.length) {
		productsLoading.value = 1 / offerQueries.value.length * 100;
	} else {
		productsLoading.value = 0;
	}
});

function getReferenceValueByKey(referenceField, key) {
	return productReference.value[referenceField][key];
}

provide('product-reference', {productReference, getReferenceValueByKey});
const clickedLocationHotelId = ref();
provide('clicked-location-hotel-id', clickedLocationHotelId);

function compareProducts(a, b) {
	if (props.options.sortBy === 'source') {
		// by order in source sheet
		const a_idx = props.hotelsList.findIndex(hotel_id_or_descriptor => {
			const a_id = typeof hotel_id_or_descriptor === 'number' ? hotel_id_or_descriptor : hotel_id_or_descriptor.id
			return a_id == a.hotel.id;
		});
		const b_idx = props.hotelsList.findIndex(hotel_id_or_descriptor => {
			const b_id = typeof hotel_id_or_descriptor === 'number' ? hotel_id_or_descriptor : hotel_id_or_descriptor.id
			return b_id == b.hotel.id;
		});
		return a_idx - b_idx;
	} else {
		// default
		return a.offers[0].price.amount - b.offers[0].price.amount;
	}
}

watchEffect(() => {
	productsList.splice(0);
	clickedLocationHotelId.value = null;
	productReference.value = {};
	offerQueries.value.forEach(offerQuery => {
		offerQuery.then(response_json => {
			if (offerQueries.value.includes(offerQuery)) {
				// console.log('--- response_json: %o', response_json);
				merge(productReference.value, omit(response_json.result, ['products', 'topProducts', 'filter', 'availableSortTypes', 'searchCriterias']));
				productsLoading.value += 1 / offerQueries.value.length * 100;
				productsList.push(...response_json.result.products);
				// productsList.sort((a, b) => a.offers[0].price.amount - b.offers[0].price.amount);
				productsList.sort(compareProducts);
			}
		});
	});
	Promise.all(offerQueries.value).then(() => {
		productsLoading.value = 0;
		initialLoading.value = !offerQueries.value.length;
		noMatchedProducts.value = productsList.length === 0;
		// console.log('--- productReference: %o', productReference.value);
	});
});

const departures = ref([]);
const selectedDeparture = ref({});
provide('selected-departure', selectedDeparture);

const matchedDepartures = computed(() => {
	const {$cityCorrectName} = getCurrentInstance().appContext.config.globalProperties;
	return departures.value.filter(dep => {
		const pattern_input = departureInputPattern.value?.trim();
		if (pattern_input) {
			const words_uc = pattern_input.toUpperCase().split(/\s+/);
			const dep_name_words_uc = ($cityCorrectName(dep.name)).toUpperCase().split(/\s+/);
			return words_uc.reduce((matched, word) => {
				if (!matched) return false;
				const idx = dep_name_words_uc.findIndex(dep_word => dep_word.indexOf(word) === 0);
				if (~idx) {
					dep_name_words_uc.splice(idx, 1);
					return true;
				}
				return false;
			}, true);
		}
		return true;
	});
});
const departureInputPattern = ref();

const controlsAffix = ref();
watchEffect(() => {
	window.controlsAffix = controlsAffix.value;
});

const gridViewMode = ref('list');
provide('grid-view-mode', gridViewMode);

onMounted(async () => {

	window.OffreVue ||= {version: '1.0.0'};

	let next_data;
	try {
		next_data = JSON.parse(document.getElementById('__NEXT_DATA__').textContent);
	} catch (ex) {
		next_data = window.__NEXT_DATA__;
	}

	departures.value = next_data.props.pageProps.meta.departures;
	selectedDeparture.value = departures.value.find(d => d.isCurrent);

	useEventListener(document, 'prefer-region', (e) => {
		selectedRegion.value = e.detail.regionName;
	});

	useEventListener(document, 'prefer-timeframe', (e) => {
		selectedTimeframe.value = e.detail.timeframeKey;
	});

	window.addEventListener('scroll', (e) => {
		controlsAffix.value?.updateRoot();
	});

});

</script>

<template>
	<div class="offre-vue" ref="$el" :data-instance-uuid="instance_uuid">
		<el-affix ref="controlsAffix" :target="`[data-instance-uuid='${ instance_uuid }']`" :offset="controlsAffixOffset">
			<div class="controls">
				<RegionSelect class="Regions" v-model="selectedRegion"
											:options-list="regionOptions"
											:wildcard-option="options.wildcardOption"></RegionSelect>

				<el-select class="CitySelect" v-model="selectedDeparture"
									 value-key="id"
									 filterable
									 default-first-option
									 :filter-method="input => departureInputPattern = input"
									 :teleported="true"
									 :fit-input-width="true"
									 popper-class="offre-select-dropdown">
					<template #prefix><span class="icon-flight"></span></template>
					<template #empty>
						<div style="text-align:center; padding: 1em;">Не найден</div>
					</template>

					<el-option v-for="departure in matchedDepartures"
										 :size="layoutMode.value === 'mobile' ? 'small' : 'default'"
										 :key="departure.id"
										 :label="departure.name"
										 :value="departure">
						<span>{{ $cityCorrectName(departure.name) }}</span>
					</el-option>
				</el-select>

				<el-select class="MonthSelect" v-if="isTimeframeSelectable"
									 v-model="selectedTimeframe"
									 :fit-input-width="true"
									 popper-class="offre-select-dropdown">
					<template #prefix><span class="icon-cal"></span></template>
					<el-option v-for="timeframe in timeframeOptions"
										 :size="layoutMode.value === 'mobile' ? 'small' : 'default'"
										 :key="timeframe"
										 :label="timeframe"
										 :value="timeframe">
					</el-option>
				</el-select>


				<el-button-group class="Tooglers">
					<el-button :type="gridViewMode === 'list' ? 'primary' : ''" @click="gridViewMode = 'list'">
						<template #icon><span class="icon-list-view"></span></template>
					</el-button>
					<el-button v-if="VueYandexMaps.isReadyToInit" :type="gridViewMode === 'map' ? 'primary' : ''"
										 @click="clickedLocationHotelId=null; gridViewMode = 'map'">
						<template #icon><span class="icon-map-view"></span></template>
					</el-button>
				</el-button-group>

			</div>
		</el-affix>
		<div v-if="!productsLoading && noMatchedProducts && selectedRegion" class="message-hint no-matched-products">
			<div class="icon warning"></div>
			<div class="reason">Из {{ $cityGenitiveCase(selectedDeparture.name) }} в данной подборке отелей нет подходящих
				вариантов.
			</div>
			<div class="hint">Пожалуйста, попробуйте поменять условия выбора &mdash; регион / город вылета / период
				путешествия
			</div>
		</div>
		<div v-if="initialLoading" class="message-hint initial-loading">
			<div class="icon info"></div>
			<div class="reason">Ищем варианты</div>
			<div class="hint">Пожалуйста, подождите...</div>
		</div>
		<ProductGrid :products="productsList" :in-progress="productsLoading"
								 :view-mode="gridViewMode"
								 @update-layout="e => { controlsAffix?.updateRoot(); controlsAffix?.update() }"></ProductGrid>
	</div>
</template>

<style lang="less">
@import "../common/css/coral-colors";

:root {
	--el-font-family: inherit !important;
	//--el-font-size-base: inherit!important;
	--el-font-size-base: 1em !important;
	--el-component-size: 2.75em !important;
	--el-fill-color-light: fade(@coral-main-blue, 8%) !important;
	--el-color-primary: @coral-main-blue;
}

.el-select-dropdown, .el-progress-bar {
	font-family: inherit;
	//font-weight: 400;
	--el-color-primary: @coral-main-blue;
	//--el-text-color-regular: black;
}

.el-select-dropdown {
	border-radius: 8px !important;
	box-shadow: 0 9px 28px 8px rgba(0, 0, 0, 0.05), 0 6px 16px 0 rgba(0, 0, 0, 0.08), 0 3px 6px -4px rgba(0, 0, 0, 0.12);
	margin: 0;
	padding: 4px;
}

.offre-select-dropdown .el-popper__arrow {
	display: none;
}

:deep(.el-popper) {
	border-radius: 8px !important;
	border: none !important;
}

:deep(.el-select-dropdown__list) {
	padding: 0;
	margin: 0;
}


.el-select-dropdown__item {
	font-size: 22px;
	line-height: 1.2;
	padding: 18px 20px;
	border-radius: 14px;
	color: #2b2b2b;
}

.el-select-dropdown__item.is-hovering {
	background: #f1f7ff;
}

.el-select-dropdown__item.is-selected {
	background: #e7f6ff;
	color: #0b78c2;
}

.offre-vue {
	.el-select {
		--el-select-width: unset;
		--el-select-border-color-hover: @coral-main-blue;

		.el-input__wrapper {
			box-shadow: none;
			border-radius: 8px;
			border: 1px solid var(--colorBorder, rgba(0, 0, 0, 0.15));
			background: var(--colorBgContainer, #FFF);
			height: 40px;

			.el-input__inner {
				color: var(--colorText);
				height: 40px;
				font-size: 14px;
				text-transform: capitalize;
			}
		}

		.el-select-dropdown__item {
			padding: 5px 12px;
		}

		.el-select__wrapper {
			font-size: unset;
		}

		.el-input__suffix {
			color: fade(black, 55%);
		}
	}

	.el-button-group {
		display: flex;
		justify-content: end;
		gap: 8px;

		&:after, &:before {
			display: none;
		}
	}
}

</style>
<style scoped lang="less">
@import "../common/css/layout";
@import "../common/css/coral-colors";

.RegionSelect {
	grid-area: Regions;
}

.CitySelect {
	grid-area: CitySelect;
}

.MonthSelect {
	grid-area: MonthSelect;
}

.Tooglers {
	grid-area: Tooglers;
}

.offre-vue {
	//max-width: 1120px;

	//width: 90vw;
	//max-width: 1370px;

	max-width: 100%;
	width: 1370px;

	margin-left: auto;
	margin-right: auto;

	.bbox();
	font-size: 16px;
	font-weight: normal;
	display: flex;
	flex-direction: column;
	gap: 1em;

	.controls {
		background: transparent;
		display: grid;
		gap: 16px;
		grid-auto-columns: 1fr;
		grid-template-columns: auto auto;
		grid-template-rows: 1fr 1fr 1fr;
		grid-template-areas:
    "Rgions Tooglers"
    "CitySelect CitySelect"
    "MonthSelect MonthSelect";


		.el-select-group {
			display: flex;
			gap: 16px;
		}

		:deep(.el-button) {
			width: 40px;
			height: 40px;
			border-radius: 8px;
			border: 1px solid #dedede;
			background: #ffffff;
			color: @coral-main-blue;
		}

		:deep(.el-button.is-plain),
		:deep(.el-button:not(.is-text)) {
			box-shadow: none;
		}

		:deep(.el-button.el-button--primary) {
			--el-button-active-bg-color: #e3f0ff;
			--el-button-hover-bg-color: #e3f0ff;
			color: @coral-main-blue;
		}

		:deep(.el-button .el-icon) {
			filter: none;
		}

		:deep(.el-select__wrapper) {
			gap: .5em;
		}

		:deep(.el-select .el-input__prefix) {
			color: #666666;
		}

		.icon-list-view {
			display: inline-flex;
			width: 1em;
			height: 1em;
			background: url("data-url:/site/coral/assets-inline/icon-list-view.svg") center / cover no-repeat;
		}

		.icon-map-view {
			display: inline-flex;
			width: 1em;
			height: 1em;
			background: url("data-url:/site/coral/assets-inline/icon-map-view.svg") center / cover no-repeat;
		}

		.icon-flight {
			display: none;
			width: 20px;
			height: 20px;
			background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 20 20' fill='none'%3E%3Cpath d='m7.5 5 1.294-2.588a1.348 1.348 0 0 1 2.412 0L12.5 5l-1.563 12.506a.944.944 0 0 1-1.874 0z' stroke='%23535353' stroke-linejoin='round'/%3E%3Cpath d='M7.5 5.833 1.667 8.75v2.5h6.25M12.5 5.833l5.834 2.917v2.5h-6.25M8.75 15.833 5 16.667v1.666h5m1.25-2.5 3.75.834v1.666h-5' stroke='%23535353' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
			background-repeat: no-repeat;
			background-position: center;
			background-size: contain;
		}

		.icon-cal {
			display: none;
			width: 20px;
			height: 20px;
			background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='18' height='16' viewBox='0 0 18 16' fill='none'%3E%3Crect x='.5' y='1.667' width='16.667' height='13.333' rx='2' stroke='%23535353' stroke-linejoin='round'/%3E%3Cpath d='M.5 3.667a2 2 0 0 1 2-2h12.667a2 2 0 0 1 2 2v2.166H.5z' stroke='%23535353' stroke-linejoin='round'/%3E%3Cpath d='M3 2.917V0m5.833 2.917V0m5.834 2.917V0' stroke='%23535353'/%3E%3C/svg%3E");
			background-repeat: no-repeat;
			background-position: center;
			background-size: contain;
		}
	}

	:deep(.el-affix--fixed) .controls {
		background: #ffffff;
	}

	.message-hint {
		display: grid;
		grid-template: auto auto / auto auto;
		gap: 1em 2em;
		padding: 2em;
		border-radius: 1em;

		&.no-matched-products {
			background: fade(@coral-main-yellow, 5%);
		}

		&.initial-loading {
			background: fade(@coral-main-blue, 5%);
		}

		.icon {
			grid-area: 1 / 1 / -1 / 2;
			justify-self: end;
			@media screen and (max-width: @narrow-breakpoint) {
				width: 2.5em;
				height: 2.5em;
			}
		}

		.reason {
			grid-area: 1 / 2;
			font-weight: 600;
		}

		.hint {
			grid-area: 2 / 2;
			font-weight: 300;
		}
	}

	.icon {
		width: 4em;
		height: 4em;
		background: center / cover no-repeat;

		&.warning {
			background-image: url("data-url:/site/coral/assets-inline/icon-warning.svg");
		}

		&.info {
			background-image: url("data-url:/site/coral/assets-inline/icon-info.svg");
		}
	}
}
</style>
