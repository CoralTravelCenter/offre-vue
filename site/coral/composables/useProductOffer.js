import {computed, reactive, ref, unref, watch} from "vue";
import dayjs from "dayjs";
import {REQUEST_STATE} from "../lib/state/request-state";
import {
  buildOfferHref,
  formatCurrencySafe,
  normalizePricingOption,
  resolvePriceSuffix,
  syncReactiveObject
} from "../lib/product-offer";
import {useTourTypeState} from "./useTourTypeState";
import {useHotelOfferSelection} from "./useHotelOfferSelection";

export function useProductOffer({
  product,
  widgetOptions,
  widgetHotelsList,
  sharedTourTypeByHotelId,
  priceLabelMode = 'detailed'
}) {
  const productSource = computed(() => unref(product) || {});
  const hotel = reactive({});
  const hotelIdKey = computed(() => (hotel.id != null ? String(hotel.id) : ''));

  const {tourType} = useTourTypeState({
    hotelIdKey,
    sharedTourTypeByHotelId,
    defaultTourType: 'package'
  });

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
  const {
    offer,
    fetchingHotelOffer,
    hotelOfferError
  } = useHotelOfferSelection({
    hotel,
    packageOffer,
    tourType
  });
  const widgetOptionsSource = computed(() => {
    const source = unref(widgetOptions);
    return source && typeof source === 'object' ? source : {};
  });
  const pricingOption = computed(() => normalizePricingOption(widgetOptionsSource.value.pricing));

  const offerFinalPrice = computed(() => {
    const amount = Number(offer.value?.price?.amount) || 0;
    const passengers = offer.value?.rooms?.[0]?.passengers?.length || 1;
    const stayNights = Number(offer.value?.stayNights) || 1;

    if (pricingOption.value === 'per-person') {
      return amount / passengers;
    }
    if (pricingOption.value === 'per-night') {
      return amount / stayNights;
    }
    return amount;
  });

  const offerFinalPriceFormatted = computed(() => {
    const valueFormatted = formatCurrencySafe(offerFinalPrice.value, offer.value?.price?.currency);
    if (!valueFormatted) {
      return '';
    }
    const suffix = resolvePriceSuffix(priceLabelMode, pricingOption.value);
    return valueFormatted + suffix;
  });

  const offerListPrice = computed(() => {
    const oldAmount = Number(offer.value?.price?.oldAmount) || 0;
    const passengers = offer.value?.rooms?.[0]?.passengers?.length || 1;
    const stayNights = Number(offer.value?.stayNights) || 1;

    if (pricingOption.value === 'per-person') {
      return oldAmount / passengers;
    }
    if (pricingOption.value === 'per-night') {
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
    return buildOfferHref({
      redirectionUrl: offer.value?.link?.redirectionUrl,
      queryParam: offer.value?.link?.queryParam,
      isHotelOnly: isHotelOnly.value,
      tourType: tourType.value,
      hostname: location.hostname
    });
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
