import {computed, reactive, ref, unref, watch} from "vue";
import dayjs from "dayjs";
import {OnlyHotelProduct} from "../../lib/b2c-api";
import {hotelCommonSearchCriterias} from "../config/globals";
import {REQUEST_STATE} from "./request-state";

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

export function useProductOffer({
  product,
  widgetOptions,
  widgetHotelsList,
  sharedTourTypeByHotelId,
  priceLabelMode = 'detailed'
}) {
  const localTourType = ref('package');
  const productSource = computed(() => unref(product) || {});
  const hotel = reactive({});
  const sharedTourTypeSource = computed(() => unref(sharedTourTypeByHotelId) || null);
  const hotelIdKey = computed(() => (hotel.id != null ? String(hotel.id) : ''));

  const tourType = computed({
    get() {
      const hotelKey = hotelIdKey.value;
      const sharedState = sharedTourTypeSource.value;
      if (hotelKey && sharedState && typeof sharedState[hotelKey] === 'string') {
        return sharedState[hotelKey];
      }
      return localTourType.value;
    },
    set(value) {
      const nextValue = value === 'hotel' ? 'hotel' : 'package';
      localTourType.value = nextValue;

      const hotelKey = hotelIdKey.value;
      const sharedState = sharedTourTypeSource.value;
      if (hotelKey && sharedState) {
        sharedState[hotelKey] = nextValue;
      }
    }
  });

  watch(hotelIdKey, (hotelKey, prevHotelKey) => {
    const sharedState = sharedTourTypeSource.value;
    if (!hotelKey) {
      return;
    }
    if (hotelKey !== prevHotelKey) {
      // При переходе на другой отель начинаем с дефолтного package,
      // чтобы состояние "только отель" не переезжало между разными карточками.
      localTourType.value = 'package';
    }
    if (!sharedState) {
      return;
    }
    if (typeof sharedState[hotelKey] !== 'string') {
      // Инициализируем общее состояние для отеля текущим локальным значением.
      sharedState[hotelKey] = localTourType.value;
    }
  }, {immediate: true});

  const packageOffers = ref([]);
  watch(
    () => productSource.value,
    (nextProduct) => {
      // Явно синхронизируем локальную модель отеля/офферов при смене продукта.
      syncReactiveObject(hotel, nextProduct?.hotel || {});
      packageOffers.value = Array.isArray(nextProduct?.offers) ? nextProduct.offers : [];
    },
    {immediate: true}
  );
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

  watch(
    [tourType, hotelOffer, packageOffer, () => hotel?.location?.id, () => hotel?.location?.type],
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

      const searchCriterias = Object.assign({}, hotelCommonSearchCriterias, {
        beginDates: [nextPackageOffer.checkInDate],
        nights: [{value: nextPackageOffer.stayNights}],
        arrivalLocations: [{id: locationId, type: locationType}]
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

  const offerRequestState = computed(() => {
    if (tourType.value === 'hotel' && fetchingHotelOffer.value) {
      return REQUEST_STATE.LOADING;
    }
    if (tourType.value === 'hotel' && hotelOfferError.value) {
      return REQUEST_STATE.ERROR;
    }
    if (offer.value) {
      return REQUEST_STATE.SUCCESS;
    }
    return REQUEST_STATE.IDLE;
  });

  return {
    hotel,
    tourType,
    fetchingHotelOffer,
    hotelOfferError,
    offerRequestState,
    offer,
    offerFinalPrice,
    offerFinalPriceFormatted,
    offerListPriceFormatted,
    isHotelOnly,
    offerHref,
    beginDate
  };
}
