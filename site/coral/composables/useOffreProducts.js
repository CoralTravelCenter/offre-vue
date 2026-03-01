import {reactive, ref, watchEffect} from "vue";
import hash from "object-hash";
import {merge, omit} from "lodash";
import {OnlyHotelProduct, PackageTourHotelProduct} from "../../lib/b2c-api";
import {hotelCommonSearchCriterias, packageCommonSearchCriterias} from "../config/globals";
import {additionalFiltersWithTerms} from "../../lib/data-ops";

export function useOffreProducts({props, matchedHotelsDirectory, selectedTimeframe, hotelInfos, selectedDeparture}) {
  const offerQueryParams = ref([]);
  const offerQueries = ref([]);

  const initialLoading = ref(true);
  const productsLoading = ref(0);
  const productsList = reactive([]);
  const productReference = ref({});
  const noMatchedProducts = ref(false);
  const clickedLocationHotelId = ref();

  watchEffect(() => {
    const searchFieldsLut = {};

    for (const matchedHotel of matchedHotelsDirectory.value) {
      const id = matchedHotel.id;
      const {searchFields} = matchedHotel.timeframes.find(tf => tf.key === selectedTimeframe.value);
      const termsHash = hash({onlyhotel: matchedHotel.onlyhotel, searchFields});

      searchFieldsLut[termsHash] ||= {
        onlyhotel: matchedHotel.onlyhotel,
        termsSearchFields: JSON.parse(JSON.stringify(searchFields)),
        locationsSearchFields: new Set()
      };

      try {
        const {location} = hotelInfos.value.find(info => info.id == id);
        searchFieldsLut[termsHash].locationsSearchFields.add({id: location.id, type: location.type});
      } catch (error) {
      }
    }

    offerQueryParams.value = Object.values(searchFieldsLut).map(termsAndLocations => {
      return termsAndLocations.onlyhotel ? Object.assign({}, hotelCommonSearchCriterias, {
        beginDates: termsAndLocations.termsSearchFields.beginDates,
        nights: termsAndLocations.termsSearchFields.nights.map(n => ({value: n})),
        arrivalLocations: [...termsAndLocations.locationsSearchFields],
        paging: {pageNumber: 1, pageSize: termsAndLocations.locationsSearchFields.size, sortType: 0},
        additionalFilters: additionalFiltersWithTerms(props.options)
      }) : Object.assign({}, packageCommonSearchCriterias, {
        beginDates: termsAndLocations.termsSearchFields.beginDates,
        nights: termsAndLocations.termsSearchFields.nights.map(n => ({value: n})),
        departureLocations: [selectedDeparture.value],
        arrivalLocations: [...termsAndLocations.locationsSearchFields],
        paging: {pageNumber: 1, pageSize: termsAndLocations.locationsSearchFields.size, sortType: 0},
        flightType: props.options.chartersOnly ? 0 : 2,
        additionalFilters: additionalFiltersWithTerms(props.options)
      });
    });
  });

  watchEffect(() => {
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
      return aIdx - bIdx;
    }

    return a.offers[0].price.amount - b.offers[0].price.amount;
  }

  watchEffect((onCleanup) => {
    productsList.splice(0);
    clickedLocationHotelId.value = null;
    productReference.value = {};

    const currentQueries = offerQueries.value;
    let aborted = false;
    onCleanup(() => {
      aborted = true;
    });

    currentQueries.forEach(offerQuery => {
      offerQuery.then(responseJson => {
        if (aborted || !currentQueries.includes(offerQuery)) {
          return;
        }

        merge(productReference.value, omit(responseJson.result, ['products', 'topProducts', 'filter', 'availableSortTypes', 'searchCriterias']));
        productsLoading.value += (1 / currentQueries.length) * 100;
        productsList.push(...responseJson.result.products);
        productsList.sort(compareProducts);
      });
    });

    Promise.all(currentQueries).then(() => {
      if (aborted) {
        return;
      }

      productsLoading.value = 0;
      initialLoading.value = !currentQueries.length;
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
    clickedLocationHotelId,
    getReferenceValueByKey
  };
}
