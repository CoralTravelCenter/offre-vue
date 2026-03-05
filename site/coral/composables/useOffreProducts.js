import {computed, reactive, ref, watch} from "vue";
import hash from "object-hash";
import {merge, omit} from "lodash";
import {OnlyHotelProduct, PackageTourHotelProduct} from "../../lib/b2c-api";
import {hotelCommonSearchCriterias, packageCommonSearchCriterias} from "../config/globals";
import {additionalFiltersWithTerms} from "../../lib/data-ops";
import {
  OFFRE_PRODUCTS_REQUEST_STATE,
  reduceOffreProductsRequestState
} from "../lib/state/offre-products-state";
import {normalizeProductsRequestState} from "../lib/state/request-state";

export function useOffreProducts({
  props,
  matchedHotelsDirectory,
  selectedTimeframe,
  hotelInfos,
  selectedDeparture,
  regionsLoading,
  reloadToken
}) {
  const requestState = ref(OFFRE_PRODUCTS_REQUEST_STATE.IDLE);
  const hasLoadedOnce = ref(false);
  const productsLoading = ref(0);
  const productsList = reactive([]);
  const productReference = ref({});
  const filtersReady = computed(() => {
    if (typeof regionsLoading?.value === 'boolean') {
      return !regionsLoading.value;
    }
    return Array.isArray(hotelInfos.value) && hotelInfos.value.length > 0;
  });
  const canEvaluateQueries = computed(() => {
    return Boolean(selectedTimeframe.value)
      && Boolean(selectedDeparture.value?.id)
      && filtersReady.value;
  });
  const initialLoading = computed(() => {
    return !hasLoadedOnce.value
      && (requestState.value === OFFRE_PRODUCTS_REQUEST_STATE.IDLE
        || requestState.value === OFFRE_PRODUCTS_REQUEST_STATE.LOADING);
  });
  const noMatchedProducts = computed(() => requestState.value === OFFRE_PRODUCTS_REQUEST_STATE.EMPTY);
  const productsError = computed(() => requestState.value === OFFRE_PRODUCTS_REQUEST_STATE.ERROR);
  const normalizedRequestState = computed(() => {
    // Унифицированный статус без специального значения empty.
    return normalizeProductsRequestState(requestState.value, OFFRE_PRODUCTS_REQUEST_STATE);
  });
  const clickedLocationHotelId = ref();
  const hotelInfoById = computed(() => {
    const lookup = new Map();
    for (const info of hotelInfos.value || []) {
      lookup.set(String(info.id), info);
    }
    return lookup;
  });
  const sourceSortOrderByHotelId = computed(() => {
    const orderLookup = new Map();
    for (let idx = 0; idx < props.hotelsList.length; idx += 1) {
      const hotelDescriptor = props.hotelsList[idx];
      const hotelId = typeof hotelDescriptor === 'number' ? hotelDescriptor : hotelDescriptor?.id;
      if (hotelId != null && !orderLookup.has(String(hotelId))) {
        orderLookup.set(String(hotelId), idx);
      }
    }
    return orderLookup;
  });

  const offerQueryParams = computed(() => {
    const searchFieldsLut = {};

    for (const matchedHotel of matchedHotelsDirectory.value) {
      const id = matchedHotel.id;
      const matchedTimeframe = matchedHotel.timeframes.find(tf => tf.key === selectedTimeframe.value);
      if (!matchedTimeframe?.searchFields) {
        continue;
      }
      const {searchFields} = matchedTimeframe;
      const termsHash = hash({onlyhotel: matchedHotel.onlyhotel, searchFields});

      searchFieldsLut[termsHash] ||= {
        onlyhotel: matchedHotel.onlyhotel,
        termsSearchFields: searchFields,
        locationsSearchFields: {}
      };

      const location = hotelInfoById.value.get(String(id))?.location;
      if (!location?.id || !location?.type) {
        continue;
      }
      const locationKey = `${location.type}:${location.id}`;
      searchFieldsLut[termsHash].locationsSearchFields[locationKey] = {id: location.id, type: location.type};
    }

    return Object.values(searchFieldsLut).map(termsAndLocations => {
      const arrivalLocations = Object.values(termsAndLocations.locationsSearchFields);
      return termsAndLocations.onlyhotel ? Object.assign({}, hotelCommonSearchCriterias, {
        beginDates: termsAndLocations.termsSearchFields.beginDates,
        nights: termsAndLocations.termsSearchFields.nights.map(n => ({value: n})),
        arrivalLocations,
        paging: {pageNumber: 1, pageSize: arrivalLocations.length, sortType: 0},
        additionalFilters: additionalFiltersWithTerms(props.options)
      }) : Object.assign({}, packageCommonSearchCriterias, {
        beginDates: termsAndLocations.termsSearchFields.beginDates,
        nights: termsAndLocations.termsSearchFields.nights.map(n => ({value: n})),
        departureLocations: [selectedDeparture.value],
        arrivalLocations,
        paging: {pageNumber: 1, pageSize: arrivalLocations.length, sortType: 0},
        flightType: props.options.chartersOnly ? 0 : 2,
        additionalFilters: additionalFiltersWithTerms(props.options)
      });
    }).filter(query => query.arrivalLocations.length > 0);
  });

  const offerQueries = computed(() => {
    const forceReload = reloadToken?.value;
    void forceReload;

    if (!canEvaluateQueries.value) {
      return [];
    }

    return offerQueryParams.value.map(queryParams => {
      return queryParams.departureLocations
        ? PackageTourHotelProduct.PriceSearchList({searchCriterias: queryParams})
        : OnlyHotelProduct.PriceSearchList({searchCriterias: queryParams});
    });
  });

  function compareProducts(a, b) {
    if (props.options.sortBy === 'source') {
      const aIdx = sourceSortOrderByHotelId.value.get(String(a?.hotel?.id)) ?? -1;
      const bIdx = sourceSortOrderByHotelId.value.get(String(b?.hotel?.id)) ?? -1;
      const aOrder = aIdx === -1 ? Number.MAX_SAFE_INTEGER : aIdx;
      const bOrder = bIdx === -1 ? Number.MAX_SAFE_INTEGER : bIdx;
      return aOrder - bOrder;
    }

    const aPrice = Number(a?.offers?.[0]?.price?.amount) || Number.MAX_SAFE_INTEGER;
    const bPrice = Number(b?.offers?.[0]?.price?.amount) || Number.MAX_SAFE_INTEGER;
    return aPrice - bPrice;
  }

  function dispatchRequestState(event) {
    requestState.value = reduceOffreProductsRequestState(requestState.value, event);
  }

  watch(offerQueries, (currentQueries, _prevQueries, onCleanup) => {
    productsList.splice(0);
    clickedLocationHotelId.value = null;
    productReference.value = {};

    if (!canEvaluateQueries.value) {
      dispatchRequestState({type: 'RESET'});
      productsLoading.value = 0;
      return;
    }
    const queryCount = currentQueries.length;
    if (!queryCount) {
      dispatchRequestState({type: 'NO_QUERIES'});
      hasLoadedOnce.value = true;
      productsLoading.value = 0;
      return;
    }
    dispatchRequestState({type: 'START_LOADING'});
    productsLoading.value = (1 / queryCount) * 100;
    let completedQueries = 0;
    let failedQueries = 0;
    let aborted = false;
    onCleanup(() => {
      aborted = true;
    });

    const queryTasks = currentQueries.map(offerQuery => {
      return offerQuery
        .then(responseJson => {
          if (aborted) {
            return;
          }
          if (!responseJson?.result) {
            return;
          }

          merge(productReference.value, omit(responseJson.result, ['products', 'topProducts', 'filter', 'availableSortTypes', 'searchCriterias']));
          if (Array.isArray(responseJson.result.products) && responseJson.result.products.length) {
            productsList.push(...responseJson.result.products);
          }
        })
        .catch(() => {
          failedQueries += 1;
        })
        .finally(() => {
          if (aborted) {
            return;
          }
          completedQueries += 1;
          productsLoading.value = queryCount ? (completedQueries / queryCount) * 100 : 0;
        });
    });

    Promise.allSettled(queryTasks).then(() => {
      if (aborted) {
        return;
      }

      productsLoading.value = 0;
      hasLoadedOnce.value = true;
      if (productsList.length > 1) {
        productsList.sort(compareProducts);
      }
      dispatchRequestState({
        type: 'RESOLVE_BATCH',
        failedQueries,
        queryCount,
        productsCount: productsList.length
      });
    });
  }, {immediate: true});

  function getReferenceValueByKey(referenceField, key) {
    return productReference.value?.[referenceField]?.[key];
  }

  return {
    initialLoading,
    productsLoading,
    productsList,
    productReference,
    requestState,
    normalizedRequestState,
    noMatchedProducts,
    productsError,
    clickedLocationHotelId,
    getReferenceValueByKey
  };
}
