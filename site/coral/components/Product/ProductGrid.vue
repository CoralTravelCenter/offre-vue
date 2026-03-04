<script setup>
import ProductCard from "./ProductCard.vue";
import {computed, onUnmounted, reactive, ref, shallowRef, watch} from "vue";
import {v4 as uuid_v4} from 'uuid';
import {invoke, until, useMediaQuery} from "@vueuse/core";
import {useProductContext} from "../../composables/useProductContext";

import {
	createYmapsOptions,
	getBoundsFromCoords,
	getLocationFromBounds,
	initYmaps,
	YandexMap,
	YandexMapClusterer,
	YandexMapDefaultFeaturesLayer,
	YandexMapDefaultSchemeLayer,
	YandexMapMarker
} from "vue-yandex-maps";
import ProductMarker from "./ProductMarker.vue";
import ProductMapOverlayCard from "./ProductMapOverlayCard.vue";

const instance_uuid = uuid_v4();

const props = defineProps({
	products: Array,
	inProgress: Boolean,
	pageNumber: {
		type: Number,
		default: 1
	},
	pageSize: {
		type: Number,
		default: 10
	},
	viewMode: {
		type: String,
		default: 'list'
	}
});
const $el = ref();
const showMapZoomControl = useMediaQuery('(max-width: 768px)');

const showProgress = ref(false);
let showProgressTimeout;
const mapSkeletonHold = ref(false);
const mapReady = ref(false);
const mapSkeletonMinElapsed = ref(false);
let mapSkeletonMinTimeout;

// Keep progress bar hidden for very short requests to avoid UI flicker.
watch(() => props.inProgress, (inProgress) => {
	if (inProgress) {
		if (!showProgressTimeout) {
			showProgressTimeout = setTimeout(() => {
				showProgress.value = true;
			});
		}
		return;
	}
	clearTimeout(showProgressTimeout);
	showProgressTimeout = null;
	showProgress.value = false;
}, {immediate: true});

onUnmounted(() => {
	clearTimeout(showProgressTimeout);
	showProgressTimeout = null;
	clearTimeout(mapSkeletonMinTimeout);
	mapSkeletonMinTimeout = null;
});

const pagedProductList = computed(() => {
	const pageNumber = Number.isFinite(props.pageNumber) ? Math.max(1, props.pageNumber) : 1;
	const pageSize = Number.isFinite(props.pageSize) ? Math.max(1, props.pageSize) : 10;
	const start = (pageNumber - 1) * pageSize;
	return props.products.slice(start, start + pageSize);
});

const map = shallowRef(null);
const map_settings = reactive({
	location: {
		center: [37.617644, 55.755819],
		zoom: 9
	},
	controls: []
});
const clusterer = shallowRef(null);
const clustererGridSize = ref(90);
const ymapsInitialized = ref(false);

// Yandex maps options are initialized only when user actually opens map mode.
invoke(async () => {
	await until(() => props.viewMode).toBe('map');
	if (ymapsInitialized.value) {
		return;
	}
	createYmapsOptions({apikey: '49de5080-fb39-46f1-924b-dee5ddbad2f1'});
	await initYmaps();
	ymapsInitialized.value = true;
});

// Do not auto-scroll on map mode switch: sticky controls can overlap map top.
watch(showMapZoomControl, (enabled) => {
	map_settings.controls = enabled ? ['zoomControl'] : [];
}, {immediate: true});

const productsWithCoordinates = computed(() => props.products.filter(product => !!product.hotel?.coordinates));

// Re-fit map bounds whenever list of mappable products changes.
watch([productsWithCoordinates, map], async ([products], _prev, onCleanup) => {
	let cancelled = false;
	onCleanup(() => {
		cancelled = true;
	});

	if (products.length > 1) {
		if (!map.value) {
			return;
		}
		const nextLocation = await getLocationFromBounds({
			bounds: getBoundsFromCoords(products.map(p => [p.hotel.coordinates.longitude, p.hotel.coordinates.latitude])),
			map: map.value,
			roundZoom: true,
			comfortZoomLevel: true
		});
		if (cancelled || !map.value) {
			return;
		}
		map.value.setLocation({
			...nextLocation,
			duration: 750
		});
		return;
	}
	if (products.length === 1) {
		map_settings.location = {
			center: [products[0].hotel.coordinates.longitude, products[0].hotel.coordinates.latitude],
			zoom: 10
		};
	}
}, {immediate: true});

function minmaxPriceFromFeatures(features) {
	return features.reduce(([min, max], feature) => {
		const price = Number(feature?.properties?.offer?.price?.amount);
		if (!Number.isFinite(price)) {
			return [min, max];
		}
		return [price < min ? price : min, price > max ? price : max];
	}, [Infinity, -Infinity]);
}

function formatClusterPrice(value) {
	if (!Number.isFinite(value)) {
		return '';
	}
	return value?.formatCurrency?.() ?? '';
}

function getClusterPriceRange(features) {
	const [minPrice, maxPrice] = minmaxPriceFromFeatures(features);
	return {
		min: formatClusterPrice(minPrice),
		max: formatClusterPrice(maxPrice)
	};
}

function hoverZIndex(e) {
	const zi = e.target.closest('ymaps').style.zIndex ?? 0;
	if (e.type === 'mouseenter') {
		e.target.closest('ymaps').style.zIndex = zi + 1;
	} else if (e.type === 'mouseleave') {
		e.target.closest('ymaps').style.zIndex = zi - 1;
	}
}

const {clickedLocationHotelId} = useProductContext();
const activeMapHotelId = ref(null);

const productsSelectedByLocation = computed(() => {
	const targetHotelId = activeMapHotelId.value ?? clickedLocationHotelId.value;
	if (!targetHotelId) {
		return [];
	}
	const matchedProduct = props.products.find(product => product.hotel.id === targetHotelId);
	return matchedProduct ? [matchedProduct] : [];
});

const productsExceptSelectedByLocation = computed(() => {
	const targetHotelId = activeMapHotelId.value ?? clickedLocationHotelId.value;
	if (targetHotelId) {
		return productsWithCoordinates.value.filter((product) => product.hotel.id !== targetHotelId);
	} else {
		return productsWithCoordinates.value;
	}
});

const activeMapProduct = computed(() => productsSelectedByLocation.value[0] || null);
const productHotelIds = computed(() => props.products.map((product) => product.hotel.id));

watch(() => clickedLocationHotelId.value, (nextId) => {
	if (nextId) {
		activeMapHotelId.value = nextId;
	}
});

watch(() => props.viewMode, (nextMode) => {
	if (nextMode !== 'map') {
		activeMapHotelId.value = null;
		mapSkeletonHold.value = false;
		mapReady.value = false;
		mapSkeletonMinElapsed.value = false;
		clearTimeout(mapSkeletonMinTimeout);
		mapSkeletonMinTimeout = null;
		return;
	}
	mapSkeletonHold.value = true;
	mapReady.value = !!map.value;
	mapSkeletonMinElapsed.value = false;
	clearTimeout(mapSkeletonMinTimeout);
	mapSkeletonMinTimeout = setTimeout(() => {
		mapSkeletonMinElapsed.value = true;
		if (mapReady.value) {
			mapSkeletonHold.value = false;
		}
		mapSkeletonMinTimeout = null;
	}, 350);
}, {immediate: true});


watch(productHotelIds, () => {
	if (!activeMapHotelId.value) {
		return;
	}
	if (!props.products.some(product => product.hotel.id === activeMapHotelId.value)) {
		activeMapHotelId.value = null;
	}
});

function handleMarkerToggle(nextHotelId) {
	activeMapHotelId.value = nextHotelId;
}

</script>

<template>
	<div ref="$el" class="product-grid" :data-instance-uuid="instance_uuid">
		<Transition name="slide-inout">
			<el-progress v-if="inProgress && showProgress" :percentage="inProgress" :indeterminate="true"
									 :show-text="false"></el-progress>
		</Transition>
		<div v-if="viewMode === 'list'" class="offers-list">
			<TransitionGroup name="slide-inout">
				<ProductCard v-for="product in pagedProductList" :product="product" :key="product.hotel.id"></ProductCard>
			</TransitionGroup>
		</div>

		<div v-if="viewMode === 'map'" class="map-view">
			<yandex-map
					v-model="map"
					:settings="map_settings"
			>
				<yandex-map-default-scheme-layer/>
				<yandex-map-default-features-layer/>

				<yandex-map-clusterer v-model="clusterer"
															:grid-size="clustererGridSize"
															zoom-on-cluster-click>
					<template #cluster="{ length, clusterer }">
						<div class="cluster" style="cursor:pointer;"
								 @mouseenter="hoverZIndex"
								 @mouseleave="hoverZIndex">
							<div class="hud">{{ length }}</div>
							<template v-for="(range, idx) in [getClusterPriceRange(clusterer.features)]" :key="idx">
								<div class="pricing">
									<span class="min">от {{ range.min }}</span>
									<span class="max">до {{ range.max }}</span>
								</div>
							</template>
						</div>
					</template>
					<yandex-map-marker v-for="product in productsExceptSelectedByLocation"
														 :settings="{
                                            coordinates: [product.hotel.coordinates.longitude, product.hotel.coordinates.latitude],
                                            properties: { hotel: product.hotel, offer: product.offers[0] }
                                       }"
														 :style="{ cursor: 'pointer' }"
														 :key="product.hotel.id">
						<ProductMarker
								:product="product"
								@mouseenter="hoverZIndex"
								@mouseleave="hoverZIndex"
								@toggle="handleMarkerToggle"
						/>
					</yandex-map-marker>
				</yandex-map-clusterer>
				<yandex-map-marker v-for="product in productsSelectedByLocation"
													 :settings="{
                                            coordinates: [product.hotel.coordinates.longitude, product.hotel.coordinates.latitude],
                                            properties: { hotel: product.hotel, offer: product.offers[0] },
                                            zIndex: 100
                                       }"
													 :style="{ cursor: 'pointer' }"
													 :key="product.hotel.id">
					<ProductMarker
							:product="product"
							initially-open
							@mouseenter="hoverZIndex"
							@mouseleave="hoverZIndex"
							@toggle="handleMarkerToggle"
					/>
				</yandex-map-marker>

			</yandex-map>
			<div v-if="activeMapProduct" class="map-selected-overlay">
				<ProductMapOverlayCard :product="activeMapProduct"/>
			</div>
		</div>

	</div>
</template>

<style scoped lang="less">
@import "../../common/css/layout";
@import "../../common/css/coral-colors";

.product-grid {
	display: flex;
	flex-direction: column;
	font-size: 16px;

	.offers-list {
		display: grid;
		gap: 8px;
		grid-template-columns: 1fr;
	}

	@media screen and (min-width: 768px) {
		.offers-list {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
	}

	@media screen and (min-width: 1024px) {
		.offers-list {
			gap: 16px;
		}
	}

	@media screen and (min-width: 1280px) {
		.offers-list {
			grid-template-columns: 1fr;
		}
	}

	.el-progress {
		overflow: hidden;
		max-height: 5em;
		.transit(opacity);
		.transit(max-height);

		&.slide-inout-enter-from, &.slide-inout-leave-to {
			opacity: 0;
			max-height: 0;
		}

	}

	.map-view {
		.proportional(16/9);
		min-height: 440px;
		border-radius: 16px;
		overflow: hidden;
		position: relative;

		.cluster {
			position: relative;
			transform: translate(-50%, -50%);
			font-size: 14px;
			line-height: 1;
			width: 2.4em;
			height: 2.4em;

			&:hover {
				.pricing {
					text-indent: 0;
					opacity: 1;
					visibility: visible;
					box-shadow: 0 1px 2px fade(black, 20%);
				}
			}

			.hud {
				position: absolute;
				inset: 0;
				display: grid;
				place-content: center;
				background-color: @coral-main-blue;
				color: white;
				border: 2px solid white;
				border-radius: 50%;
				box-shadow: 0 1px 2px fade(black, 20%);
			}

			.pricing {
				position: absolute;
				z-index: -1;
				top: 2px;
				background: fade(white, 90%);
				backdrop-filter: blur(4px);
				border-radius: 100px 3em 3em 100px;
				font-size: .75em;
				display: flex;
				flex-direction: column;
				justify-content: space-evenly;
				align-items: flex-end;
				height: 2.8em;
				padding: 0 0.5em 0 3.5em;
				overflow: hidden;
				text-indent: -10em;
				opacity: 0;
				visibility: hidden;
				box-shadow: none;
				.transit(text-indent, .25s);
				.transit(opacity, .25s);
				.transit(box-shadow, .25s);
			}
		}

	}

}

.map-selected-overlay {
	position: absolute;
	inset: 0;
	width: 100%;
	height: 100%;
	bottom: 8px;
	z-index: 12;
	display: flex;
	align-items: flex-end;
	justify-content: center;
	pointer-events: none;
}

.map-selected-overlay > * {
	pointer-events: auto;
}
</style>
