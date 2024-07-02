<script setup>
import { computed, getCurrentInstance, inject, ref, watchEffect } from "vue";
import { hotelCommonSearchCriterias } from "../config/globals";
import { OnlyHotelProduct } from "../../lib/b2c-api";

import icon_default from 'data-url:/site/sunmar/assets-inline/hotel-marker-default.svg';
import icon_cfc from 'data-url:/site/sunmar/assets-inline/hotel-marker-cfc.svg';
import icon_elite from 'data-url:/site/sunmar/assets-inline/hotel-marker-elite.svg';
import dayjs from "dayjs";

import { openedMapMarker } from "./global-state";

const $this = getCurrentInstance();

// const props = defineProps(['product','initiallyOpen']);
const props = defineProps({
    product: Object,
    initiallyOpen: {
        type: Boolean,
        default: false
    }
});

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
const offerListPrice = computed(() => {
    if (widgetOptions.pricing === 'per-person') {
        return offer.value.price.oldAmount / offer.value.rooms[0].passengers.length;
    } else if (widgetOptions.pricing === 'per-night') {
        return offer.value.price.oldAmount / offer.value.stayNights;
    } else {
        return offer.value.price.oldAmount;
    }
});
const offerListPriceFormatted = computed(() => {
    return offerListPrice.value.formatCurrency(offer.value.price.currency);
});

const placemarkIconUrl = computed(() => {
    if (hotel.sunFamilyClub || hotel.coralFamilyClub) return icon_cfc;
    if (hotel.eliteHotel) return icon_elite;
    return icon_default;
});

const isOpen = ref(props.initiallyOpen);
defineExpose({ hide: () => isOpen.value = false });

const selectedDeparture = inject('selected-departure');
const { getReferenceValueByKey } = inject('product-reference');

const { name: hotelCategoryName, starCount: hotelStarCount } = getReferenceValueByKey('hotelCategories', hotel.categoryKey);
const { name: mealType } = getReferenceValueByKey('meals', offer.value.rooms[0].mealKey)

const offerHref = computed(() => {
    const host = location.hostname === 'localhost' ? '//new.sunmar.ru' : '';
    const url_fix = ~offer.value.link.redirectionUrl.indexOf('/hotels') ? '' : '/hotels';
    return `${ host }${ url_fix }${ offer.value.link.redirectionUrl }/?qp=${ offer.value.link.queryParam }&p=${ (isHotelOnly.value || tourType.value !== 'package') ? 2 : 1 }`;
});

const beginDate = computed(() => {
    return dayjs(offer.value.flight ? offer.value.flight.flightDate : offer.value.checkInDate).format('DD/MM/YYYY');
});

function handleClick() {
    isOpen.value = !isOpen.value;
    openedMapMarker.value = isOpen.value ? $this : null;
}

const widgetHotelsList = inject('widget-hotels-list');
const isHotelOnly = computed(() => {
    return widgetHotelsList.find(hotel_setup => hotel_setup.id == hotel.id)?.onlyhotel;
});

</script>

<template>
    <div class="marker" :class="{ open: isOpen }" @click="handleClick">
        <div class="placemark" :style="{ backgroundImage: `url(${ placemarkIconUrl })` }"></div>
        <div class="popover">
            <div class="visual" :style="{ backgroundImage: `url(${ hotel.images[0].sizes.find(s => s.type===4).url })` }"></div>
            <div class="info-pricing">
                <div class="info">
                    <div class="category-concept">
                        <div v-if="hotelStarCount" class="stars">
                            <span v-for="n in hotelStarCount" class="filled"></span>
                            <span v-for="n in (5-hotelStarCount)" class="empty"></span>
                        </div>
                        <span v-else class="category-name">{{ hotelCategoryName }}</span>
                        <div class="concepts">
                            <span v-if="hotel.eliteHotel" class="elite-service-badge"><span>ELITE SERVICE</span></span>
                            <span v-if="hotel.sunFamilyClub || hotel.coralFamilyClub" class="cfc-badge"></span>
                        </div>
                    </div>
                    <h3 class="name">{{ hotel.name }}</h3>
                    <ul class="terms">
                        <li v-if="offer.flight" class="departure">из {{ $cityGenitiveCase(selectedDeparture.name) }}</li>
                        <li class="begin-date">{{ beginDate }}</li>
                        <li class="stay-nights">{{ offer.stayNights }} {{ offer.stayNights.asNights() }}</li>
                        <li class="meal-type">{{ mealType }}</li>
                    </ul>
                </div>
                <div class="pricing">
                    <div class="tour-type">
                        <button v-if="!isHotelOnly" class="package" :class="{ selected: tourType === 'package' }" @click.stop="tourType = 'package'">Тур с перелетом</button>
                        <button class="only-hotel" :class="{ selected: isHotelOnly || tourType === 'hotel' }" @click.stop="tourType = 'hotel'">Только отель</button>
                    </div>
                    <div class="price" v-loading="fetchingHotelOffer">
                        <div v-if="offer.price.oldAmount" class="list-price">{{ offerListPriceFormatted }}</div>
                        <div class="final-price" v-html="offerFinalPriceFormatted"></div>
                    </div>
                    <a :href="offerHref" class="do-choose" target="_blank" @click.stop v-loading="fetchingHotelOffer">Выбрать</a>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped lang="less">
@import "../common/css/layout";
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
    &.open {
        .popover {
            padding: 0 1em 0 0;
            border-radius: .5em;
            box-shadow: 2px -2px 16px fade(black, 20%);
            .info-pricing {
                padding: 1em 0;
                .pricing {
                    gap: 1em;
                    margin-top: .5em;
                    .final-price {
                        font-size: 1.2em;
                        font-weight: bold;
                    }
                }
            }
        }
    }
    &:not(.open) {
        .popover {
            gap: 0;
            .info-pricing {
                padding: 0;
                gap: 0;
                .pricing {
                    .tour-type {
                        display: none;
                    }
                    .do-choose {
                        display: none;
                    }
                    .list-price {
                        display: none;
                    }
                }
            }
            .visual, .info {
                font-size: 0;
            }
        }
    }
    .popover {
        position: absolute;
        z-index: -1;
        line-height: 1.5;
        padding: 0 .5em 0 2.2em;
        border-radius: 100px;
        left: 2px;
        top: auto;
        bottom: 1em;
        max-width: unset;
        box-shadow: 1px 1px 2px fade(black, 25%);
        background: fade(white, 90%);
        backdrop-filter: blur(4px);
        display: flex;
        gap: 1em;
        overflow: hidden;
        .transit(box-shadow, .25s);
        .visual {
            .proportional(1/1);
            background: center / cover no-repeat;
            width: 9em;
            flex-shrink: 0;
        }
        .info-pricing {
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            .info {
                .category-concept {
                    font-size: (12/14em);
                    margin-bottom: .75em;
                    display: flex;
                    align-items: center;
                    .category-name {
                        color: @coral-main-yellow;
                    }
                    .concepts {
                        margin-left: auto;
                        display: flex;
                        align-items: center;
                        gap: 1em;
                        .elite-service-badge {
                            display: inline-grid;
                            place-content: center;
                            padding: 0 .5em;
                            font-weight: 300;
                            background-color: #333;
                            color: white;
                            font-size: 1.2em;
                            height: 1em;
                            white-space: nowrap;
                            >span {
                                font-size: .62em;
                                letter-spacing: .15em;
                            }
                        }
                        .cfc-badge {
                            display: block;
                            aspect-ratio: 153/35;
                            font-size: 1.25em;
                            height: 1em;
                            background: url("data-url:/site/sunmar/assets-inline/coral-family-club.svg") center / cover no-repeat;
                        }
                    }
                }
                .stars {
                    display: inline-grid;
                    grid-template-columns: repeat(5,auto);
                    gap: 2px;
                    margin-right: 1em;
                    >*{
                        width: 1.2em;
                        height: (96/101) * 1.2em;
                        background: center / cover no-repeat;
                        &.filled {
                            background-image: url(data-url:/site/sunmar/assets-inline/rating-star-filled.svg);
                        }
                        &.empty {
                            background-image: url(data-url:/site/sunmar/assets-inline/rating-star-empty.svg);
                        }
                    }
                }
                .name {
                    font-size: inherit;
                    line-height: 1;
                    margin: 0;
                    white-space: nowrap;
                }
                ul.terms {
                    display: flex;
                    align-items: baseline;
                    white-space: nowrap;
                    gap: 1em;
                    list-style: none;
                    margin: .5em 0 0 0;
                    padding: 0;
                    font-size: .66em;
                    >li {
                        display: inline-flex;
                        align-items: center;
                        &:before {
                            content: '';
                            height: 1.2em;
                            margin-right: .5em;
                            background: center / cover no-repeat;
                        }
                        &.departure:before {
                            width: (42/33) * 1.2em;
                            background-image: url(data-url:/site/sunmar/assets-inline/icon-flight.svg);
                        }
                        &.begin-date:before {
                            width: (32/33) * 1.2em;
                            background-image: url(data-url:/site/sunmar/assets-inline/icon-cal.svg);
                        }
                        &.stay-nights:before {
                            width: (40/33) * 1.2em;
                            background-image: url(data-url:/site/sunmar/assets-inline/icon-bed.svg);
                        }
                        &.meal-type:before {
                            width: (43/33) * 1.2em;
                            background-image: url(data-url:/site/sunmar/assets-inline/icon-meal.svg);
                        }
                    }
                }
            }
            .pricing {
                width: 100%;
                display: flex;
                gap: 0;
                .tour-type {
                    flex: 0 1;
                    width: 100%;
                    display: flex;
                    flex-direction: column;
                    font-size: .66em;
                    white-space: nowrap;
                    button {
                        flex: 1;
                        .interactive();
                        background: transparent;
                        font-size: inherit;
                        line-height: 1.4;
                        //height: (32/14em);
                        place-content: center;
                        border: 1px solid fade(black, 15%);
                        .transit(color);
                        cursor: pointer;
                        &.selected {
                            position: relative;
                            z-index: 1;
                            pointer-events: none;
                            color: @coral-main-blue;
                            border-color: currentColor;
                        }
                        &:nth-of-type(n+2) {
                            margin-top: -1px;
                        }
                        &:first-of-type {
                            border-top-left-radius: .5em;
                            border-top-right-radius: .5em;
                        }
                        &:last-of-type {
                            border-bottom-left-radius: .5em;
                            border-bottom-right-radius: .5em;
                        }
                    }
                }
                .price {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    justify-content: space-evenly;
                    .list-price {
                        text-decoration: line-through @coral-red-error;
                        font-size: .7em;
                    }
                }
                .do-choose {
                    .interactive();
                    display: grid;
                    place-content: center;
                    font-size: (12/14em);
                    font-weight: 300;
                    text-decoration: none;
                    //height: 3em;
                    color: white;
                    background: @coral-main-blue;
                    border-radius: .5em;
                    padding: 0 1em;
                }
            }
        }
    }
}
</style>