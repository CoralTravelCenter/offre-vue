<script setup>
import { computed, inject, ref } from "vue";
import dayjs from "dayjs";

const props = defineProps(['product']);

const widgetOptions = inject('widget-options');

const { hotel, offers } = props.product;
const offer = ref(offers[0]);

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
        'per-person': ' / чел.',
        'per-night': '<span class="per-night"> за ночь</span>',
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

const beginDate = computed(() => {
    return offer.value.flight ? dayjs(offer.value.flight.flightDate).format('DD/MM/YYYY') : '';
});

const selectedDeparture = inject('selected-departure');
const { getReferenceValueByKey } = inject('product-reference');

const { name: hotelCategoryName, starCount: hotelStarCount } = getReferenceValueByKey('hotelCategories', hotel.categoryKey);
const { name: mealType } = getReferenceValueByKey('meals', offer.value.rooms[0].mealKey)

const tourType = ref('package');

const offerHref = computed(() => {
    const host = location.hostname === 'localhost' ? '//new.coral.ru' : '';
    const url_fix = ~offer.value.link.redirectionUrl.indexOf('/hotels') ? '' : '/hotels';
    return `${ host }${ url_fix }${ offer.value.link.redirectionUrl }/?qp=${ offer.value.link.queryParam }`;
});

</script>

<template>
    <div class="product-card">
        <div class="visual-details">
            <div class="visual" :style="{ backgroundImage: `url(${ hotel.images[0].sizes.find(s => s.type===4).url })` }"></div>
            <div class="details">
                <div class="location">{{ hotel.locationSummary }}</div>
                <div class="category">
                    <div v-if="hotelStarCount" class="stars">
                        <span v-for="n in hotelStarCount" class="filled"></span>
                        <span v-for="n in (5-hotelStarCount)" class="empty"></span>
                    </div>
                    <span v-else class="category-name">{{ hotelCategoryName }}</span>
                </div>
                <h3 class="name">{{ hotel.name }}</h3>
                <ul class="terms">
                    <li v-if="offer.flight" class="departure">из {{ $cityGenitiveCase(selectedDeparture.name) }}</li>
                    <li class="begin-date">{{ beginDate }}</li>
                    <li class="stay-nights">{{ offer.stayNights }} {{ offer.stayNights.asNights() }}</li>
                    <li class="meal-type">{{ mealType }}</li>
                </ul>
            </div>
        </div>
        <div class="pricing">
            <div class="tour-type">
                <button class="package" :class="{ selected: tourType === 'package' }" @click="tourType = 'package'">Тур с перелетом</button>
                <button class="only-hotel" :class="{ selected: tourType === 'hotel' }" @click="tourType = 'hotel'">Только отель</button>
            </div>
            <div class="tour-info">
                <div class="price-discount">
                    <div class="price">
                        <div class="from-wording">цена от:</div>
                        <div v-if="offer.price.oldAmount" class="list-price">{{ offerListPriceFormatted }}</div>
                        <div class="final-price" v-html="offerFinalPriceFormatted"></div>
                    </div>
                    <div class="discount" v-if="offer.price.discountPercent">
                        {{ offer.price.discountPercent }}% Скидка
                    </div>
                </div>
                <div class="cashback">

                </div>
                <a :href="offerHref" class="do-choose" target="_blank">Выбрать</a>
            </div>
        </div>
    </div>
</template>

<style scoped lang="less">
@import "../common/css/coral-colors";
@import "../common/css/layout";
.product-card {
    display: flex;
    background-color: white;
    border-radius: 1em;
    box-shadow: 0 0 0 1px fade(black, 6%);
    color: black;
    >* {
        padding: .5em;
    }
    .visual-details {
        width: 70%;
        display: flex;
    }
    .visual {
        flex-shrink: 0;
        width: 38%;
        .proportional(4/3);
        background: center / cover no-repeat;
        border-radius: .7em;
    }
    .details {
        flex: 1 1 auto;
        display: flex;
        flex-direction: column;
        justify-content: center;
        gap: 1em;
        padding: 0 2em;
        >* {
            line-height: 1;
            margin: 0;
        }
        .location {
            display: flex;
            align-items: center;
            font-weight: 300;
            &:before {
                content: '';
                height: 1.2em;
                width: (10/16) * 1.2em;
                background: url("data-url:/site/coral/assets-inline/location-placemark.svg") center / cover no-repeat;
                margin-right: .3em;
            }
        }
        .category {
            .category-name {
                color: @coral-main-yellow;
            }
        }
        h3.name {
            font-size: (20/14em);
            font-weight: bold;
        }
        .stars {
            display: inline-grid;
            grid-template-columns: repeat(5,auto);
            gap: 2px;
            >*{
                width: 1.2em;
                height: (96/101) * 1.2em;
                background: center / cover no-repeat;
                &.filled {
                    background-image: url(data-url:/site/coral/assets-inline/rating-star-filled.svg);
                }
                &.empty {
                    background-image: url(data-url:/site/coral/assets-inline/rating-star-empty.svg);
                }
            }
        }
        ul.terms {
            display: flex;
            align-items: baseline;
            gap: 1em;
            list-style: none;
            margin: 0;
            padding: 0;
            font-size: (12/14em);
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
                    background-image: url(data-url:/site/coral/assets-inline/icon-flight.svg);
                }
                &.begin-date:before {
                    width: (32/33) * 1.2em;
                    background-image: url(data-url:/site/coral/assets-inline/icon-cal.svg);
                }
                &.stay-nights:before {
                    width: (40/33) * 1.2em;
                    background-image: url(data-url:/site/coral/assets-inline/icon-bed.svg);
                }
                &.meal-type:before {
                    width: (43/33) * 1.2em;
                    background-image: url(data-url:/site/coral/assets-inline/icon-meal.svg);
                }
            }
        }
    }
    .pricing {
        width: 30%;
        border-left: 1px solid fade(black, 10%);
        display: grid;
        grid-template-rows: auto 1fr;
        gap: 1em;
        padding: 1em;
        .tour-type {
            width: 100%;
            display: grid;
            grid-template-columns: minmax(0,1fr) 1px minmax(0,1fr);
            button {
                .interactive();
                background: transparent;
                line-height: 1;
                height: (32/14em);
                place-content: center;
                border: 1px solid fade(black, 15%);
                .transit(color);
                cursor: pointer;
                &.selected {
                    pointer-events: none;
                    color: @coral-main-blue;
                    border-color: currentColor;
                    z-index: 1;
                }

                &.package {
                    grid-row: 1;
                    grid-column: 1 / span 2;
                    border-radius: .5em 0 0 .5em;
                }

                &.only-hotel {
                    grid-row: 1;
                    grid-column: 2 / span 2;
                    border-radius: 0 .5em .5em 0;
                }
            }
        }
        .tour-info {
            display: flex;
            flex-direction: column;
            .price-discount {
                display: grid;
                grid-template-columns: 1fr auto;
                position: relative;
                align-items: flex-end;
                .price {
                    line-height: 1;
                    white-space: nowrap;
                    .from-wording {
                        font-size: (10/14em);
                        color: @coral-grey;
                        margin-bottom: 1em;
                    }
                    .list-price {
                        text-decoration: line-through @coral-red-error;
                        margin-bottom: .5em;
                    }
                    .final-price {
                        //font-size: (24/14em);
                        font-size: 2em;
                        font-weight: 600;
                        color: @coral-main-blue;
                        :deep(.per-night) {
                            font-size: 62%;
                            font-weight: 300;
                        }
                    }
                }
                .discount {
                    position: absolute;
                    right: 0;
                    bottom: 0;
                    display: grid;
                    place-content: center;
                    //font-size: (12/14em);
                    line-height: 1;
                    height: 2em;
                    padding: 0 1em;
                    background: #52C41A;
                    color: white;
                    border-radius: .5em .5em 0 .5em;
                    transform: translateX(calc(1em + 10px));
                    &:after {
                        content: '';
                        position: absolute;
                        top: 100%;
                        right: 0;
                        width: 10px;
                        height: 7px;
                        background: linear-gradient(to bottom right, darken(#52C41A, 10%) 50%, transparent 55%);
                    }
                }
            }
            .cashback {
                margin: auto;
            }
            .do-choose {
                margin-top: auto;
                .interactive();
                display: grid;
                place-content: center;
                font-size: (16/14em);
                text-decoration: none;
                height: 3em;
                color: white;
                background: @coral-main-blue;
                border-radius: .5em;
            }
        }
    }

    //overflow: hidden;
    max-height: 20em;
    .transit(opacity);
    .transit(max-height);
    &.slide-inout-enter-from, &.slide-inout-leave-to {
        opacity: 0;
        max-height: 0;
    }

}
</style>