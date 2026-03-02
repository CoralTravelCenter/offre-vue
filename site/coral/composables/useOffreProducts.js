import {reactive, ref, watchEffect} from "vue";
import hash from "object-hash";
import {merge, omit} from "lodash";
import {OnlyHotelProduct, PackageTourHotelProduct} from "../../lib/b2c-api";
import {hotelCommonSearchCriterias, packageCommonSearchCriterias} from "../config/globals";
import {additionalFiltersWithTerms} from "../../lib/data-ops";

export function useOffreProducts({
  props,
  matchedHotelsDirectory,
  selectedTimeframe,
  hotelInfos,
  selectedDeparture,
  reloadToken
}) {
  const offerQueryParams = ref([]);
  const offerQueries = ref([]);

  const initialLoading = ref(true);
  const productsLoading = ref(0);
  const productsList = reactive([]);
  const productReference = ref({});
  const noMatchedProducts = ref(false);
  const productsError = ref(false);
  const clickedLocationHotelId = ref();

  watchEffect(() => {
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
        termsSearchFields: JSON.parse(JSON.stringify(searchFields)),
        locationsSearchFields: {}
      };

      try {
        const {location} = hotelInfos.value.find(info => info.id == id);
        if (!location?.id || !location?.type) {
          continue;
        }
        const locationKey = `${location.type}:${location.id}`;
        searchFieldsLut[termsHash].locationsSearchFields[locationKey] = {id: location.id, type: location.type};
      } catch (error) {
      }
    }

    offerQueryParams.value = Object.values(searchFieldsLut).map(termsAndLocations => {
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

  watchEffect(() => {
    const forceReload = reloadToken?.value;
    void forceReload;

    offerQueries.value = offerQueryParams.value.map(queryParams => {
      return queryParams.departureLocations
        ? PackageTourHotelProduct.PriceSearchList({searchCriterias: queryParams})
        : OnlyHotelProduct.PriceSearchList({searchCriterias: queryParams});
    });

    if (offerQueries.value.length) {
      productsLoading.value = (1 / offerQueries.value.length) * 100;
    } else {
      productsLoading.value = 0;
    }
  });

  function compareProducts(a, b) {
    if (props.options.sortBy === 'source') {
      const aIdx = props.hotelsList.findIndex(hotelIdOrDescriptor => {
        const aId = typeof hotelIdOrDescriptor === 'number' ? hotelIdOrDescriptor : hotelIdOrDescriptor.id;
        return aId == a.hotel.id;
      });
      const bIdx = props.hotelsList.findIndex(hotelIdOrDescriptor => {
        const bId = typeof hotelIdOrDescriptor === 'number' ? hotelIdOrDescriptor : hotelIdOrDescriptor.id;
        return bId == b.hotel.id;
      });
      const aOrder = aIdx === -1 ? Number.MAX_SAFE_INTEGER : aIdx;
      const bOrder = bIdx === -1 ? Number.MAX_SAFE_INTEGER : bIdx;
      return aOrder - bOrder;
    }

    const aPrice = Number(a?.offers?.[0]?.price?.amount) || Number.MAX_SAFE_INTEGER;
    const bPrice = Number(b?.offers?.[0]?.price?.amount) || Number.MAX_SAFE_INTEGER;
    return aPrice - bPrice;
  }

  watchEffect((onCleanup) => {
    productsList.splice(0);
    clickedLocationHotelId.value = null;
    productReference.value = {};
    noMatchedProducts.value = false;
    productsError.value = false;

    const currentQueries = offerQueries.value;
    const queryCount = currentQueries.length;
    let completedQueries = 0;
    let failedQueries = 0;
    let aborted = false;
    onCleanup(() => {
      aborted = true;
    });

    const queryTasks = currentQueries.map(offerQuery => {
      return offerQuery
        .then(responseJson => {
          if (aborted || !currentQueries.includes(offerQuery)) {
            return;
          }
          if (!responseJson?.result) {
            return;
          }

          merge(productReference.value, omit(responseJson.result, ['products', 'topProducts', 'filter', 'availableSortTypes', 'searchCriterias']));
          if (Array.isArray(responseJson.result.products) && responseJson.result.products.length) {
            productsList.push(...responseJson.result.products);
            productsList.sort(compareProducts);
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
      initialLoading.value = !queryCount;
      productsError.value = queryCount > 0 && failedQueries === queryCount;
      noMatchedProducts.value = productsList.length === 0;
    });
  });

  function getReferenceValueByKey(referenceField, key) {
    return productReference.value[referenceField][key];
  }

  return {
    initialLoading,
    productsLoading,
    productsList,
    productReference,
    noMatchedProducts,
    productsError,
    clickedLocationHotelId,
    getReferenceValueByKey
  };
}
