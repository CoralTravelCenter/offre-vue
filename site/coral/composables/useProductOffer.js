import {computed, ref, watchEffect} from "vue";
import dayjs from "dayjs";
import {OnlyHotelProduct} from "../../lib/b2c-api";
import {hotelCommonSearchCriterias} from "../config/globals";

const priceSuffixMap = {
  detailed: {
    'per-person': ' / чел.',
    'per-night': '<span class="per-night"> за ночь</span>',
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

export function useProductOffer({product, widgetOptions, widgetHotelsList, priceLabelMode = 'detailed'}) {
  const tourType = ref('package');

  const {hotel, offers: packageOffers} = product;
  const hotelOffer = ref();
  const fetchingHotelOffer = ref(false);
  const offer = ref();

  watchEffect(() => {
    if (tourType.value === 'package') {
      offer.value = packageOffers[0];
    } else if (tourType.value === 'hotel') {
      if (hotelOffer.value) {
        offer.value = hotelOffer.value;
      } else {
        const searchCriterias = Object.assign({}, hotelCommonSearchCriterias, {
          beginDates: [packageOffers[0].checkInDate],
          nights: [{value: packageOffers[0].stayNights}],
          arrivalLocations: [{id: hotel.location.id, type: hotel.location.type}]
        });
        fetchingHotelOffer.value = true;
        OnlyHotelProduct.PriceSearchList({searchCriterias}).then(responseJson => {
          offer.value = hotelOffer.value = responseJson.result.products[0].offers[0];
          fetchingHotelOffer.value = false;
        });
      }
    }
  });

  const offerFinalPrice = computed(() => {
    if (widgetOptions.pricing === 'per-person') {
      return offer.value.price.amount / offer.value.rooms[0].passengers.length;
    } else if (widgetOptions.pricing === 'per-night') {
      return offer.value.price.amount / offer.value.stayNights;
    }
    return offer.value.price.amount;
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
    if (widgetOptions.pricing === 'per-person') {
      return offer.value.price.oldAmount / offer.value.rooms[0].passengers.length;
    } else if (widgetOptions.pricing === 'per-night') {
      return offer.value.price.oldAmount / offer.value.stayNights;
    }
    return offer.value.price.oldAmount;
  });

  const offerListPriceFormatted = computed(() => {
    return formatCurrencySafe(offerListPrice.value, offer.value?.price?.currency);
  });

  const isHotelOnly = computed(() => {
    return widgetHotelsList.find(hotelSetup => hotelSetup.id == hotel.id)?.onlyhotel;
  });

  const offerHref = computed(() => {
    const host = location.hostname === 'localhost' ? '//new.coral.ru' : '';
    const urlFix = ~offer.value.link.redirectionUrl.indexOf('/hotels') ? '' : '/hotels';
    return `${host}${urlFix}${offer.value.link.redirectionUrl}/?qp=${offer.value.link.queryParam}&p=${(isHotelOnly.value || tourType.value !== 'package') ? 2 : 1}`;
  });

  const beginDate = computed(() => {
    return dayjs(offer.value.flight ? offer.value.flight.flightDate : offer.value.checkInDate).format('DD/MM/YYYY');
  });

  return {
    hotel,
    tourType,
    fetchingHotelOffer,
    offer,
    offerFinalPrice,
    offerFinalPriceFormatted,
    offerListPriceFormatted,
    isHotelOnly,
    offerHref,
    beginDate
  };
}
