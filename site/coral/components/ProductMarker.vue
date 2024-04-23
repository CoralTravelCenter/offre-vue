<script setup>
import { computed, inject, ref, watchEffect } from "vue";
import { hotelCommonSearchCriterias } from "../config/globals";
import { OnlyHotelProduct } from "../../lib/b2c-api";

import icon_default from 'data-url:/site/coral/assets-inline/hotel-marker-default.svg';
import icon_cfc from 'data-url:/site/coral/assets-inline/hotel-marker-cfc.svg';
import icon_elite from 'data-url:/site/coral/assets-inline/hotel-marker-elite.svg';

const props = defineProps(['product']);

const tourType = ref('package');

const { hotel, offers: packageOffers } = props.product;
const hotelOffer = ref();
const fetchingHotelOffer = ref(false);
const offer = ref();

watchEffect(() => {
    if (tourType.value === 'package') {
        offer.value = packageOffers[0];
    } else if (tourType.value === 'hotel') {
        if (hotelOffer.value) offer.value = hotelOffer.value
        else {
            const searchCriterias = Object.assign({}, hotelCommonSearchCriterias, {
                beginDates: [packageOffers[0].checkInDate],
                nights: [{ value: packageOffers[0].stayNights }],
                arrivalLocations: [{ id: hotel.location.id, type: hotel.location.type }]
            });
            fetchingHotelOffer.value = true;
            OnlyHotelProduct.PriceSearchList({ searchCriterias }).then(response_json => {
                offer.value = hotelOffer.value = response_json.result.products[0].offers[0];
                fetchingHotelOffer.value = false;
            });
        }
    }
});

const widgetOptions = inject('widget-options');

const offerFinalPrice = computed(() => {
    if (widgetOptions.pricing === 'per-person') {
        return offer.value.price.amount / offer.value.rooms[0].passengers.length;
    } else if (widgetOptions.pricing === 'per-night') {
        return offer.value.price.amount / offer.value.stayNights;
    } else {
        return offer.value.price.amount;
    }
});
const offerFinalPriceFormatted = computed(() => {
    const value_formatted = offerFinalPrice.value.formatCurrency(offer.value.price.currency);
    const pricing_option = widgetOptions.pricing || 'default';
    const suffix = {
        // 'per-person': ' / чел.',
        'per-person': '',
        // 'per-night': '<span class="per-night"> за ночь</span>',
        'per-night': '',
        default: ''
    }[pricing_option];
    return value_formatted + suffix;
});

const placemarkIconUrl = computed(() => {
    if (hotel.sunFamilyClub || hotel.coralFamilyClub) return icon_cfc;
    if (hotel.eliteHotel) return icon_elite;
    return icon_default;
});

</script>

<template>
    <div class="marker">
        <div class="placemark" :style="{ backgroundImage: `url(${ placemarkIconUrl })` }"></div>
        <div class="pricing" v-html="offerFinalPriceFormatted"></div>
    </div>
</template>

<style scoped lang="less">
@import "../common/css/coral-colors";
.marker {
    font-size: 14px;
    line-height: 1;
    position: relative;
    width: 2em;
    height: (43/33) * 2em;
    transform: translate(-50%, -100%);
    .placemark {
        position: absolute;
        inset: 0;
        background: center / cover no-repeat;
    }
    .pricing {
        position: absolute;
        z-index: -1;
        line-height: 1.5;
        padding: 0 .5em 0 2.2em;
        border-radius: 100px;
        left: 2px;
        top: 1px;
        box-shadow: 1px 1px 2px fade(black, 25%);
        background: fade(white, 80%);
        backdrop-filter: blur(4px);
    }
}
</style>