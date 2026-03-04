<script setup>
import {computed, nextTick, onMounted, onUnmounted, ref, watch} from "vue";
import {useMediaQuery, useScriptTag, useUrlSearchParams} from "@vueuse/core";
import dayjs from "dayjs";
import locale_ru from "dayjs/locale/ru";
import ProductGrid from "../Product";
import ProductCardSkeleton from "../Product/ProductCardSkeleton.vue";
import OffreControls from "./OffreControls.vue";
import OffreHints from "./OffreHints.vue";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationNext,
  PaginationPrevious
} from "app/components/ui/pagination";
import {v4 as uuid_v4} from "uuid";
import {useOffreLayout} from "../../composables/useOffreLayout";
import {useOffreFilters} from "../../composables/useOffreFilters";
import {useOffreProducts} from "../../composables/useOffreProducts";
import {provideOffreContext} from "../../composables/useOffreContext";

dayjs.locale(locale_ru);

const DESKTOP_LAYOUT_BREAKPOINT = "(min-width: 993px)";
const DEFAULT_PAGE_SIZE = 10;
const PAGER_SIBLING_COUNT = 1;
const STICKY_BOTTOM_OFFSET = 16;
const CONTROLS_STICKY_Z_INDEX = 30;
const PAGER_STICKY_Z_INDEX = 20;
const MV_MODE_TOP_OFFSET = 100;
const DESKTOP_TOP_OFFSET = 16;
const MOBILE_TOP_OFFSET = 74;

const instance_uuid = uuid_v4();

const props = defineProps({
  options: {
    type: Object,
    default: {groupBy: 'countries', chartersOnly: true}
  },
  hotelsList: {type: Array, default: []}
});

const $el = ref();
const calcCashbackFn = ref(() => {
});

useScriptTag('https://b2ccdn.coral.ru/content/scripts/getbonus.js', () => {
  calcCashbackFn.value = window._get_CBonuses;
});

// Shared layout mode (mobile/desktop) is consumed by nested components.
const {layoutMode} = useOffreLayout();

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

// Increment this token to force re-fetch without mutating filter state.
const productsReloadToken = ref(0);

const {
  initialLoading,
  productsLoading,
  productsList,
  productReference,
  normalizedRequestState,
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

const sharedTourTypeByHotelId = ref({});

watch(productsList, (nextProducts) => {
  const knownHotelIds = new Set(
    (nextProducts || []).map((product) => String(product?.hotel?.id ?? ''))
  );
  for (const hotelId of Object.keys(sharedTourTypeByHotelId.value)) {
    if (!knownHotelIds.has(hotelId)) {
      delete sharedTourTypeByHotelId.value[hotelId];
    }
  }
}, {immediate: true});


const isLargeScreen = useMediaQuery(DESKTOP_LAYOUT_BREAKPOINT);
const searchParams = useUrlSearchParams('history');
const isMvMode = computed(() => {
  const raw = searchParams.mv;
  const value = Array.isArray(raw) ? raw[0] : raw;
  return String(value).toLowerCase() === 'true';
});

// Sticky top offset depends on /?mv=true mode and current layout.
const controlsStickyOptions = computed(() => ({
  top: isMvMode.value
    ? MV_MODE_TOP_OFFSET
    : (isLargeScreen.value ? DESKTOP_TOP_OFFSET : MOBILE_TOP_OFFSET),
  bottom: STICKY_BOTTOM_OFFSET,
  side: 'both',
  zIndex: CONTROLS_STICKY_Z_INDEX
}));

const gridViewMode = ref('list');
provideOffreContext({
  widgetOptions: props.options,
  widgetHotelsList: props.hotelsList,
  calcCashback: {calcCashbackFn},
  layoutMode,
  selectedDeparture,
  sharedTourTypeByHotelId,
  productReference: {productReference, getReferenceValueByKey},
  clickedLocationHotelId,
  gridViewMode
});

// List-mode pagination state.
const productListPageNumber = ref(1);
const productListPageSize = ref(DEFAULT_PAGE_SIZE);
const totalPages = computed(() => Math.ceil(productsList.length / productListPageSize.value));
const productGridRef = ref();
const hasScrolledPastFirstCard = ref(false);
let firstCardObserver = null;

watch(totalPages, (pages) => {
  if (!pages) {
    productListPageNumber.value = 1;
    return;
  }
  // Keep current page valid when filters shrink result set.
  if (productListPageNumber.value > pages) {
    productListPageNumber.value = pages;
  }
}, {immediate: true});

const pagerStickyOptions = computed(() => ({
  top: 0,
  bottom: STICKY_BOTTOM_OFFSET,
  side: 'bottom',
  zIndex: PAGER_STICKY_Z_INDEX
}));

const showProductSkeleton = computed(() => {
  return initialLoading.value || (productsLoading.value > 0 && productsList.length === 0);
});

function disconnectFirstCardObserver() {
  if (firstCardObserver) {
    firstCardObserver.disconnect();
    firstCardObserver = null;
  }
}

function observeFirstCard() {
  disconnectFirstCardObserver();
  hasScrolledPastFirstCard.value = false;

  if (gridViewMode.value !== 'list' || showProductSkeleton.value || totalPages.value <= 1) {
    return;
  }

  const gridRoot = productGridRef.value?.$el;
  const firstCardEl = gridRoot?.querySelector('.offers-list > *');
  if (!firstCardEl) {
    return;
  }

  // Show pager only after user has scrolled past the first card.
  firstCardObserver = new IntersectionObserver(([entry]) => {
    if (!entry) {
      return;
    }
    hasScrolledPastFirstCard.value = entry.boundingClientRect.bottom <= 0;
  }, {threshold: 0});

  firstCardObserver.observe(firstCardEl);
}

const shouldShowPager = computed(() => {
  return gridViewMode.value === 'list' && totalPages.value > 1 && hasScrolledPastFirstCard.value;
});

watch(
  [() => productsList.length, gridViewMode, productListPageNumber, showProductSkeleton, totalPages],
  async () => {
    await nextTick();
    observeFirstCard();
  },
  {immediate: true}
);

onMounted(() => {
  window.OffreVue ||= {version: '1.0.0'};
  nextTick(() => {
    observeFirstCard();
  });
});

onUnmounted(() => {
  disconnectFirstCardObserver();
});

</script>

<template>
  <div class="offre-vue" ref="$el" :data-instance-uuid="instance_uuid">
    <div
        class="controls-sticky offre-sticky-shadow overflow-clip pb-2 rounded-2xl border border-[rgba(0,0,0,0.15)] bg-white"
        v-sticky="controlsStickyOptions"
    >
      <OffreControls
          v-model:selected-region="selectedRegion"
          :region-options="regionOptions"
          :regions-loading="regionsLoading"
          :wildcard-option="options.wildcardOption"
          v-model:selected-departure-id="selectedDepartureId"
          :departures="departures"
          v-model:selected-timeframe="selectedTimeframe"
          :timeframe-options="timeframeOptions"
          :is-timeframe-selectable="isTimeframeSelectable"
          v-model:grid-view-mode="gridViewMode"
          @request-map-mode="clickedLocationHotelId = null"
      />
    </div>

    <OffreHints
        :initial-loading="initialLoading"
        :products-loading="productsLoading"
        :request-state="normalizedRequestState"
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

    <ProductGrid
        ref="productGridRef"
        :products="productsList"
        :in-progress="productsLoading"
        :view-mode="gridViewMode"
        :page-number="productListPageNumber"
        :page-size="productListPageSize"
    />

    <div
        v-show="shouldShowPager"
        class="pager-sticky offre-sticky-shadow mx-auto w-fit overflow-clip rounded-2xl border border-[rgba(0,0,0,0.15)] bg-white"
        v-sticky="pagerStickyOptions"
    >
      <div class="p-2">
        <Pagination
            v-model:page="productListPageNumber"
            :items-per-page="productListPageSize"
            :total="productsList.length"
            :sibling-count="PAGER_SIBLING_COUNT"
            class="w-auto"
        >
          <PaginationContent v-slot="{ items }" class="gap-2">
            <PaginationPrevious
                class="h-10 w-10 min-w-10 rounded-lg border border-[#d4d9df] bg-white p-0 text-[#1f2227] shadow-none hover:border-[#0d98d9] hover:bg-white hover:text-[#0d98d9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6eb8dd] focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-60 [&>span]:hidden [&>svg]:h-5 [&>svg]:w-5"
            />
            <template v-for="(item, index) in items"
                      :key="`pager-item-${index}-${item.type}-${item.value ?? 'ellipsis'}`">
              <PaginationItem
                  v-if="item.type === 'page'"
                  :value="item.value"
                  :is-active="item.value === productListPageNumber"
                  :class="[
                    'h-10 w-10 min-w-10 rounded-lg border border-[#d4d9df] bg-white p-0 text-[#1f2227] shadow-none hover:border-[#0d98d9] hover:bg-white hover:text-[#0d98d9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6eb8dd] focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-60',
                    item.value === productListPageNumber ? 'bg-[#0d98d9] border-[#0d98d9] text-white' : ''
                  ]"
              >
                {{ item.value }}
              </PaginationItem>
              <PaginationEllipsis v-else :index="index" class="h-10 w-10 text-[#1f2227]"/>
            </template>
            <PaginationNext
                class="h-10 w-10 min-w-10 rounded-lg border border-[#d4d9df] bg-white p-0 text-[#1f2227] shadow-none hover:border-[#0d98d9] hover:bg-white hover:text-[#0d98d9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6eb8dd] focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-60 [&>span]:hidden [&>svg]:h-5 [&>svg]:w-5"
            />
          </PaginationContent>
        </Pagination>
      </div>
    </div>
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

.offre-vue .controls-sticky {
  padding-bottom: 8px;
}

.product-skeleton-list {
	display: grid;
	gap: 8px;
	grid-template-columns: 1fr;
}

@media screen and (min-width: 768px) {
	.product-skeleton-list {
		grid-template-columns: repeat(2, minmax(0, 1fr));
	}
}

@media screen and (min-width: 1024px) {
  .offre-vue .controls-sticky {
    padding: 8px 8px 8px 0;
  }
}

@media screen and (min-width: 1280px) {
  .product-skeleton-list {
    grid-template-columns: 1fr;
  }
}

</style>
