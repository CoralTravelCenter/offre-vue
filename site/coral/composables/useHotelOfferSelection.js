import {computed, ref, watch} from "vue";
import {OnlyHotelProduct} from "../../lib/b2c-api";
import {hotelCommonSearchCriterias} from "../config/globals";

function buildHotelSearchCriterias(basePackageOffer, hotel) {
  return Object.assign({}, hotelCommonSearchCriterias, {
    beginDates: [basePackageOffer.checkInDate],
    nights: [{value: basePackageOffer.stayNights}],
    arrivalLocations: [{id: hotel.location.id, type: hotel.location.type}]
  });
}

export function useHotelOfferSelection({
  hotel,
  packageOffer,
  tourType
}) {
  const hotelOffer = ref();
  const fetchingHotelOffer = ref(false);
  const hotelOfferError = ref(null);
  const hotelOfferRequestId = ref(0);
  const offer = ref(packageOffer.value);
  const hotelLocation = computed(() => hotel.location || {});

  watch(
    [() => hotel.id, () => packageOffer.value?.checkInDate, () => packageOffer.value?.stayNights],
    () => {
      hotelOffer.value = undefined;
      if (tourType.value === 'package') {
        offer.value = packageOffer.value;
      }
    },
    {immediate: true}
  );

  watch(
    [tourType, hotelOffer, packageOffer, () => hotelLocation.value.id, () => hotelLocation.value.type],
    ([nextTourType, nextHotelOffer, nextPackageOffer, locationId, locationType], _prev, onCleanup) => {
      const requestId = ++hotelOfferRequestId.value;
      let cancelled = false;
      onCleanup(() => {
        cancelled = true;
      });

      if (nextTourType === 'package') {
        fetchingHotelOffer.value = false;
        hotelOfferError.value = null;
        offer.value = nextPackageOffer;
        return;
      }

      if (nextHotelOffer) {
        fetchingHotelOffer.value = false;
        hotelOfferError.value = null;
        offer.value = nextHotelOffer;
        return;
      }

      if (!nextPackageOffer || !locationId || !locationType) {
        hotelOfferError.value = new Error('Hotel offer cannot be loaded: missing base package offer or hotel location');
        offer.value = nextPackageOffer;
        fetchingHotelOffer.value = false;
        return;
      }

      const searchCriterias = buildHotelSearchCriterias(nextPackageOffer, hotel);
      hotelOfferError.value = null;
      fetchingHotelOffer.value = true;
      OnlyHotelProduct.PriceSearchList({searchCriterias})
        .then(responseJson => {
          if (cancelled || requestId !== hotelOfferRequestId.value) {
            return;
          }
          const nextOffer = responseJson?.result?.products?.[0]?.offers?.[0];
          if (!nextOffer) {
            throw new Error('OnlyHotelProduct returned empty offers');
          }
          offer.value = nextOffer;
          hotelOffer.value = nextOffer;
        })
        .catch(error => {
          if (cancelled || requestId !== hotelOfferRequestId.value) {
            return;
          }
          hotelOfferError.value = error;
          offer.value = nextPackageOffer;
        })
        .finally(() => {
          if (cancelled || requestId !== hotelOfferRequestId.value) {
            return;
          }
          fetchingHotelOffer.value = false;
        });
    },
    {immediate: true}
  );

  return {
    offer,
    fetchingHotelOffer,
    hotelOfferError
  };
}
