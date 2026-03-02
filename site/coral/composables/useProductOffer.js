import {computed, reactive, ref, unref, watch, watchEffect} from "vue";
import dayjs from "dayjs";
import {OnlyHotelProduct} from "../../lib/b2c-api";
import {hotelCommonSearchCriterias} from "../config/globals";

const priceSuffixMap = {
  detailed: {
    'per-person': '<span class="per-person"> / чел</span>',
    'per-night': '<span class="per-night"> за ночь</span>',
    default: ''
  },
  compact: {
    'per-person': '',
    'per-night': '',
    default: ''
  }
};

function formatCurrencySafe(value, currency) {
  if (value == null) {
    return '';
  }
  return typeof value.formatCurrency === 'function'
    ? value.formatCurrency(currency)
    : '';
}

function syncReactiveObject(target, source) {
  for (const key of Object.keys(target)) {
    if (!(key in source)) {
      delete target[key];
    }
  }
  Object.assign(target, source);
}

export function useProductOffer({product, widgetOptions, widgetHotelsList, priceLabelMode = 'detailed'}) {
  const tourType = ref('package');
  const productSource = computed(() => unref(product) || {});
  const hotel = reactive({});
  const packageOffers = ref([]);
  watchEffect(() => {
    syncReactiveObject(hotel, productSource.value?.hotel || {});
    packageOffers.value = Array.isArray(productSource.value?.offers) ? productSource.value.offers : [];
  });
  const packageOffer = computed(() => packageOffers.value?.[0]);
  const hotelOffer = ref();
  const fetchingHotelOffer = ref(false);
  const offer = ref(packageOffer.value);
  const hotelOfferError = ref(null);
  const hotelOfferRequestId = ref(0);
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

  watchEffect((onCleanup) => {
    const requestId = ++hotelOfferRequestId.value;
    let cancelled = false;
    onCleanup(() => {
      cancelled = true;
    });

    if (tourType.value === 'package') {
      fetchingHotelOffer.value = false;
      hotelOfferError.value = null;
      offer.value = packageOffer.value;
    } else if (tourType.value === 'hotel') {
      if (hotelOffer.value) {
        fetchingHotelOffer.value = false;
        hotelOfferError.value = null;
        offer.value = hotelOffer.value;
      } else {
        if (!packageOffer.value || !hotel?.location?.id || !hotel?.location?.type) {
          hotelOfferError.value = new Error('Hotel offer cannot be loaded: missing base package offer or hotel location');
          offer.value = packageOffer.value;
          fetchingHotelOffer.value = false;
          return;
        }
        const searchCriterias = Object.assign({}, hotelCommonSearchCriterias, {
          beginDates: [packageOffer.value.checkInDate],
          nights: [{value: packageOffer.value.stayNights}],
          arrivalLocations: [{id: hotel.location.id, type: hotel.location.type}]
        });
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
            offer.value = packageOffer.value;
          })
          .finally(() => {
            if (cancelled || requestId !== hotelOfferRequestId.value) {
              return;
            }
            fetchingHotelOffer.value = false;
          });
      }
    }
  });

  const offerFinalPrice = computed(() => {
    const amount = Number(offer.value?.price?.amount) || 0;
    const passengers = offer.value?.rooms?.[0]?.passengers?.length || 1;
    const stayNights = Number(offer.value?.stayNights) || 1;

    if (widgetOptions.pricing === 'per-person') {
      return amount / passengers;
    } else if (widgetOptions.pricing === 'per-night') {
      return amount / stayNights;
    }
    return amount;
  });

  const offerFinalPriceFormatted = computed(() => {
    const valueFormatted = formatCurrencySafe(offerFinalPrice.value, offer.value?.price?.currency);
    if (!valueFormatted) {
      return '';
    }
    const pricingOption = widgetOptions.pricing || 'default';
    const selectedMap = priceSuffixMap[priceLabelMode] || priceSuffixMap.detailed;
    const suffix = selectedMap[pricingOption] || selectedMap.default;
    return valueFormatted + suffix;
  });

  const offerListPrice = computed(() => {
    const oldAmount = Number(offer.value?.price?.oldAmount) || 0;
    const passengers = offer.value?.rooms?.[0]?.passengers?.length || 1;
    const stayNights = Number(offer.value?.stayNights) || 1;

    if (widgetOptions.pricing === 'per-person') {
      return oldAmount / passengers;
    } else if (widgetOptions.pricing === 'per-night') {
      return oldAmount / stayNights;
    }
    return oldAmount;
  });

  const offerListPriceFormatted = computed(() => {
    return formatCurrencySafe(offerListPrice.value, offer.value?.price?.currency);
  });

  const widgetHotelsListSource = computed(() => {
    const list = unref(widgetHotelsList);
    return Array.isArray(list) ? list : [];
  });
  const isHotelOnly = computed(() => {
    const hotelId = hotel.id;
    if (!hotelId) {
      return false;
    }
    const hotelSetup = widgetHotelsListSource.value.find(hotelDescriptor => {
      const id = typeof hotelDescriptor === 'number' ? hotelDescriptor : hotelDescriptor?.id;
      return String(id) === String(hotelId);
    });
    return typeof hotelSetup === 'object' && Boolean(hotelSetup?.onlyhotel);
  });

  const offerHref = computed(() => {
    const redirectionUrl = offer.value?.link?.redirectionUrl;
    if (!redirectionUrl) {
      return '#';
    }
    const host = location.hostname === 'localhost' ? '//new.coral.ru' : '';
    const urlFix = redirectionUrl.includes('/hotels') ? '' : '/hotels';
    const queryParam = offer.value?.link?.queryParam || '';
    return `${host}${urlFix}${redirectionUrl}/?qp=${queryParam}&p=${(isHotelOnly.value || tourType.value !== 'package') ? 2 : 1}`;
  });

  const beginDate = computed(() => {
    const dateValue = offer.value?.flight?.flightDate || offer.value?.checkInDate;
    if (!dateValue) {
      return '';
    }
    return dayjs(dateValue).format('DD/MM/YYYY');
  });

  return {
    hotel,
    tourType,
    fetchingHotelOffer,
    hotelOfferError,
    offer,
    offerFinalPrice,
    offerFinalPriceFormatted,
    offerListPriceFormatted,
    isHotelOnly,
    offerHref,
    beginDate
  };
}
