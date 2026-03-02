<script setup>
import ProductCard from "./ProductCard.vue";
import { computed, inject, onUnmounted, reactive, ref, shallowRef, watch } from "vue";
import { v4 as uuid_v4 } from 'uuid';
import { invoke, until } from "@vueuse/core";
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationNext,
    PaginationPrevious
} from "app/components/ui/pagination";

import {
    createYmapsOptions,
    YandexMap,
    YandexMapDefaultSchemeLayer,
    YandexMapDefaultFeaturesLayer,
    YandexMapControls,
    YandexMapZoomControl,
    YandexMapClusterer,
    YandexMapMarker,
    getLocationFromBounds, getBoundsFromCoords
} from "vue-yandex-maps";
import ProductMarker from "./ProductMarker.vue";

const instance_uuid = uuid_v4();

const props = defineProps({
    products: Array,
    inProgress: Boolean,
    viewMode: {
        type: String,
        default: 'list'
    }
});
const $el = ref();

const layoutMode = inject('layout-mode');

const showProgress = ref(false);
let showProgressTimeout;

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
}, { immediate: true });

onUnmounted(() => {
    clearTimeout(showProgressTimeout);
    showProgressTimeout = null;
});

const productListPageNumber = ref(1);
const productListPageSize = ref(10);
const totalPages = computed(() => Math.ceil(props.products.length / productListPageSize.value));
const pagedProductList = computed(() => {
    const start = (productListPageNumber.value-1) * productListPageSize.value;
    return props.products.slice(start, start + productListPageSize.value);
});

watch(totalPages, (pages) => {
    if (!pages) {
        productListPageNumber.value = 1;
        return;
    }
    if (productListPageNumber.value > pages) {
        productListPageNumber.value = pages;
    }
}, { immediate: true });

const pagerBottomOffset = computed(() => layoutMode?.value === 'mobile' ? 64 : 0);
const pagerStickyOffset = computed(() => ({ top: 0, bottom: pagerBottomOffset.value }));
const pagerStickyOptions = computed(() => ({
    ...pagerStickyOffset.value,
    side: 'bottom',
    zIndex: 20
}));

const map = shallowRef(null);
const map_settings = reactive({
    location: {
        center: [37.617644, 55.755819],
        zoom: 9
    }
});
const clusterer = shallowRef(null);
const clustererGridSize = ref(90);

invoke(async () => {
    await until(() => props.viewMode).toBe('map');
    createYmapsOptions({ apikey: '49de5080-fb39-46f1-924b-dee5ddbad2f1' });
});

watch(() => props.viewMode, (mode) => {
    if (mode === 'map') {
        $el.value?.scrollIntoView();
    }
});

const productsWithCoordinates = computed(() => props.products.filter(product => !!product.hotel?.coordinates));

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
}, { immediate: true });

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

const clickedLocationHotelId = inject('clicked-location-hotel-id');

const productsSelectedByLocation = computed(() => {
    if (!clickedLocationHotelId.value) {
        return [];
    }
    const matchedProduct = props.products.find(product => product.hotel.id == clickedLocationHotelId.value);
    return matchedProduct ? [matchedProduct] : [];
});

const productsExceptSelectedByLocation = computed(() => {
    if (clickedLocationHotelId.value) {
        return productsWithCoordinates.value.filter((product) => product.hotel.id != clickedLocationHotelId.value);
    } else {
        return productsWithCoordinates.value;
    }
});

</script>

<template>
    <div ref="$el" class="product-grid" :data-instance-uuid="instance_uuid">
        <Transition name="slide-inout">
            <el-progress v-if="inProgress && showProgress" :percentage="inProgress" :indeterminate="true" :show-text="false"></el-progress>
        </Transition>
        <div v-if="viewMode === 'list'" class="offers-list">
            <TransitionGroup name="slide-inout">
                <ProductCard v-for="product in pagedProductList" :product="product" :key="product.hotel.id"></ProductCard>
            </TransitionGroup>
        </div>
        <div v-show="viewMode === 'list' && totalPages > 1"
             class="pager-sticky"
             v-sticky="pagerStickyOptions">
            <div class="pager">
                <Pagination
                        v-model:page="productListPageNumber"
                        :items-per-page="productListPageSize"
                        :total="products.length"
                        :sibling-count="1"
                >
                    <PaginationContent v-slot="{ items }">
                        <PaginationPrevious class="h-9 w-9 p-0 [&>span]:hidden"/>
                        <template v-for="(item, index) in items" :key="`page-item-${index}-${item.type}-${item.value ?? 'ellipsis'}`">
                            <PaginationItem
                                    v-if="item.type === 'page'"
                                    :value="item.value"
                                    :is-active="item.value === productListPageNumber"
                                    class="h-9 min-w-9 px-0"
                            >
                                {{ item.value }}
                            </PaginationItem>
                            <PaginationEllipsis v-else :index="index" class="h-9 w-9"/>
                        </template>
                        <PaginationNext class="h-9 w-9 p-0 [&>span]:hidden"/>
                    </PaginationContent>
                </Pagination>
            </div>
        </div>

        <div v-if="viewMode === 'map'" class="map-view">
            <yandex-map v-model="map" :settings="map_settings">
                <yandex-map-default-scheme-layer/>
                <yandex-map-default-features-layer/>
                <yandex-map-controls :settings="{ position: 'right' }">
                    <yandex-map-zoom-control/>
                </yandex-map-controls>

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
                        <ProductMarker :product="product" @mouseenter="hoverZIndex" @mouseleave="hoverZIndex"/>
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
                    <ProductMarker :product="product" initially-open @mouseenter="hoverZIndex" @mouseleave="hoverZIndex"/>
                </yandex-map-marker>

            </yandex-map>
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

    .pager {
        display: grid;
        place-content: center;
        padding: 1em .5em;
        background: fade(white, 80%);
        backdrop-filter: blur(8px);
        border-radius: 1em 1em 0 0;
    }

    .map-view {
        .proportional(16/9);
        min-height: 440px;
        border-radius: 16px;
        overflow: hidden;

        .cluster {
            position: relative;
            transform: translate(-50%,-50%);
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
</style>
