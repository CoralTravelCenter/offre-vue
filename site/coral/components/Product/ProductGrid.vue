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

const mapSkeletonHold = ref(false);
const mapReady = ref(false);
const mapSkeletonMinElapsed = ref(false);
let mapSkeletonMinTimeout;

onUnmounted(() => {
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
	const matchedProduct = props.products.find(product => String(product?.hotel?.id ?? '') === String(targetHotelId));
	return matchedProduct ? [matchedProduct] : [];
});

const productsExceptSelectedByLocation = computed(() => {
	const targetHotelId = activeMapHotelId.value ?? clickedLocationHotelId.value;
	if (targetHotelId) {
		return productsWithCoordinates.value.filter((product) => String(product?.hotel?.id ?? '') !== String(targetHotelId));
	} else {
		return productsWithCoordinates.value;
	}
});

const activeMapProduct = computed(() => productsSelectedByLocation.value[0] || null);
const productHotelIds = computed(() => {
	return props.products
		.map((product) => String(product?.hotel?.id ?? ''))
		.filter(Boolean);
});

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
	if (!props.products.some(product => String(product?.hotel?.id ?? '') === String(activeMapHotelId.value))) {
		activeMapHotelId.value = null;
	}
});

function handleMarkerToggle(nextHotelId) {
	activeMapHotelId.value = nextHotelId;
}

</script>

<template>
	<div ref="$el" class="product-grid flex flex-col text-[16px]" :data-instance-uuid="instance_uuid">
		<div
			v-if="viewMode === 'list'"
			class="offers-list grid grid-cols-1 gap-2 min-[768px]:grid-cols-2 min-[1024px]:gap-4 min-[1280px]:grid-cols-1"
		>
			<TransitionGroup name="slide-inout">
				<ProductCard v-for="product in pagedProductList" :product="product" :key="product.hotel.id"></ProductCard>
			</TransitionGroup>
		</div>

		<div v-if="viewMode === 'map'" class="map-view relative aspect-video min-h-[440px] overflow-hidden rounded-[16px]">
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
						<div
							class="cluster group relative h-[2.4em] w-[2.4em] -translate-x-1/2 -translate-y-1/2 cursor-pointer text-[14px] leading-none"
								 @mouseenter="hoverZIndex"
								 @mouseleave="hoverZIndex">
							<div class="hud absolute inset-0 grid place-content-center rounded-full border-2 border-white bg-primary text-primary-foreground shadow-[0_1px_2px_rgba(0,0,0,0.2)]">{{ length }}</div>
							<template v-for="(range, idx) in [getClusterPriceRange(clusterer.features)]" :key="idx">
								<div class="pricing absolute -z-[1] top-[2px] flex h-[2.8em] flex-col items-end justify-evenly overflow-hidden rounded-[100px_3em_3em_100px] bg-white/90 px-[0.5em] pl-[3.5em] text-[0.75em] indent-[-10em] opacity-0 invisible shadow-none [text-wrap:nowrap] backdrop-blur-[4px] transition-[text-indent,opacity,box-shadow,visibility] duration-[250ms] group-hover:indent-0 group-hover:opacity-100 group-hover:visible group-hover:shadow-[0_1px_2px_rgba(0,0,0,0.2)]">
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
			<div
				v-if="activeMapProduct"
				class="map-selected-overlay pointer-events-none absolute inset-0 bottom-2 z-[12] flex h-full w-full items-end justify-center"
			>
				<ProductMapOverlayCard class="pointer-events-auto" :product="activeMapProduct"/>
			</div>
		</div>

	</div>
</template>
