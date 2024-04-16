<script setup>
import { computed, inject, ref, watchEffect } from "vue";
import dayjs from "dayjs";
import { OnlyHotelProduct } from "../../lib/b2c-api";
import { hotelCommonSearchCriterias } from "../config/globals";

const props = defineProps(['product']);

const widgetOptions = inject('widget-options');
const { calcCashbackFn } = inject('calc-cashback');

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
    return dayjs(offer.value.flight ? offer.value.flight.flightDate : offer.value.checkInDate).format('DD/MM/YYYY');
});

const selectedDeparture = inject('selected-departure');
const { getReferenceValueByKey } = inject('product-reference');

const { name: hotelCategoryName, starCount: hotelStarCount } = getReferenceValueByKey('hotelCategories', hotel.categoryKey);
const { name: mealType } = getReferenceValueByKey('meals', offer.value.rooms[0].mealKey)

const offerHref = computed(() => {
    const host = location.hostname === 'localhost' ? '//new.coral.ru' : '';
    const url_fix = ~offer.value.link.redirectionUrl.indexOf('/hotels') ? '' : '/hotels';
    return `${ host }${ url_fix }${ offer.value.link.redirectionUrl }/?qp=${ offer.value.link.queryParam }&p=${ isHotelOnly || tourType.value !== 'package' ? 2 : 1 }`;
});

const cashbackInfo = computed(() => {
    return calcCashbackFn.value({
        id: hotel.id,
        night: offer.value.stayNights,
        star: hotelStarCount,
        price: offerFinalPrice.value,
        checkInDate: offer.value.checkInDate,
        countryID: hotel.countryKey,
        isOnlyHotel: isHotelOnly || tourType.value === 'hotel'
    });
});

const widgetHotelsList = inject('widget-hotels-list');
const hotelUspsList = computed(() => {
    return widgetHotelsList.find(hotel_setup => hotel_setup.id == hotel.id)?.usps;
});
const isHotelOnly = computed(() => {
    return widgetHotelsList.find(hotel_setup => hotel_setup.id == hotel.id)?.onlyhotel;
});

</script>

<template>
    <div class="product-card">
        <div class="visual-details">
            <div class="visual" :style="{ backgroundImage: `url(${ hotel.images[0].sizes.find(s => s.type===4).url })` }">
                <div class="badge-grid">
                    <div v-if="hotel.recommended" class="badge">Рекомендуем</div>
                    <div v-if="hotel.exclusive" class="badge exclusive">Эксклюзив</div>
                </div>
            </div>
            <div class="details">
                <div class="location">{{ hotel.locationSummary }}</div>
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
                <ul class="usps" v-if="hotelUspsList">
                    <li v-for="usp in hotelUspsList">{{ usp }}</li>
                </ul>
            </div>
        </div>
        <div class="pricing">
            <div class="tour-type">
                <button v-if="!isHotelOnly" class="package" :class="{ selected: tourType === 'package' }" @click="tourType = 'package'">Тур с перелетом</button>
                <button class="only-hotel" :class="{ selected: isHotelOnly || tourType === 'hotel' }" @click="tourType = 'hotel'">Только отель</button>
            </div>
            <div class="tour-info" :class="{ blocked: fetchingHotelOffer }">
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
                <el-popover placement="top" width="30em" trigger="click" :teleported="false">
                    <div class="offre-vue-cashback-popover">
                        <div class="promos-grid">
                            <template v-for="promo in (cashbackInfo?.listOfPromos ?? [])">
                                <span class="value">{{ promo.content_result.formatCurrency() }}</span>
                                <a v-if="promo.content_link" :href="promo.content_link" class="description" target="_blank">{{ promo.content_txt }}</a>
                                <span v-else class="description">{{ promo.content_txt }}</span>
                            </template>
                            <div class="info-action">
                                <div class="info">Для начисления бонусов, укажите номер карты в поле "Примечание к заказу"</div>
                                <a href="https://coralbonus.ru/registration?promo=R3R5VO93GKG8N1PGQC1UP0G6EICQLRWEN3Z64WZGC4YBYIKHFJV55IND5O20WUJ" class="action" target="_blank">Активировать</a>
                            </div>
                        </div>
                    </div>
                    <template #reference>
                        <div class="cashback">
                            <div class="info">
                                <span class="up-to">Кешбэк до {{ cashbackInfo?.finalBonus.formatCurrency() }}</span>
                                <span class="to-coral-bonus-card">на карту CoralBonus</span>
                            </div>
                            <img class="card-visual" src="https://cdn.coral.ru/content/cms/russia/cb_bonus_24/cb_card.png" alt="">
                        </div>
                    </template>
                </el-popover>
                <a :href="offerHref" class="do-choose" target="_blank">Выбрать</a>
            </div>
        </div>
    </div>
</template>

<style lang="less">
@import "../common/css/coral-colors";
@import "../common/css/layout";
.offre-vue-cashback-popover {
    font-size: (12/14em);
    .promos-grid {
        display: grid;
        grid-template-columns: auto 1fr;
        gap: 1px 0;
        background: fade(@coral-grey, 20%);
        >* {
            background: white;
        }
        .value {
            height: 3em;
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-weight: 600;
            padding-right: 1em;
            text-align: right;
            &:before {
                content: '+ ';
            }
        }
        a.description {
            text-decoration: underline;
        }
        .description {
            display: flex;
            align-items: center;
            line-height: 1.1;
            height: 3em;
            color: inherit;
        }
    }
    .info-action {
        padding-top: 1em;
        grid-column: 1 / span 2;
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 2em;
        .info {
            font-weight: 600;
            color: black;
        }
        .action {
            .interactive();
            display: inline-grid;
            place-content: center;
            font-size: (14/12em);
            white-space: nowrap;
            line-height: 1;
            height: 2.5em;
            padding: 0 1em;
            border-radius: .5em;
            color: white;
            background: @coral-main-blue;
        }
    }
}
</style>

<style scoped lang="less">
@import "../common/css/coral-colors";
@import "../common/css/layout";
.product-card {
    display: flex;
    background-color: white;
    border-radius: 1em;
    box-shadow: 0 0 0 1px fade(black, 6%);
    color: black;
    max-height: 20em;
    .transit(opacity);
    .transit(max-height);
    @media screen and (max-width: @mobile-breakpoint) {
        flex-direction: column;
        max-height: none;
    }
    >* {
        padding: .5em;
    }
    .visual-details {
        width: 70%;
        display: flex;
        @media screen and (max-width: @mobile-breakpoint) {
            width: 100%;
            flex-direction: column;
        }
    }
    .visual {
        flex-shrink: 0;
        width: 38%;
        .proportional(4/3);
        background: center / cover no-repeat;
        border-radius: .7em;
        @media screen and (max-width: @mobile-breakpoint) {
            .proportional(16/9);
            width: 100%;
        }
        .badge-grid {
            font-size: (12/14em);
            font-weight: 300;
            display: grid;
            grid-template-rows: repeat(auto-fit, 2em);
            justify-items: start;
            gap: 1em;
            grid-auto-flow: column dense;
            padding: 1em;
            filter: drop-shadow(1px 1px 2px fade(black,15%));
            .badge {
                color: black;
                background: white;
                border-radius: 100px;
                line-height: 2;
                padding: 0 1em;
                @media screen and (max-width: @narrow-breakpoint) {
                    line-height: 2.1;
                }
                &.exclusive {
                    background-color: #e84f0e;
                    color: white;
                }
            }
        }
    }
    .details {
        flex: 1 1 auto;
        display: flex;
        flex-direction: column;
        justify-content: center;
        gap: 1em;
        padding: 0 2em;
        @media screen and (max-width: @mobile-breakpoint) {
            padding: 2em 1em 1em;
        }
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
        .category-concept {
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
                    background: url("data-url:/site/coral/assets-inline/coral-family-club.svg") center / cover no-repeat;
                }
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
        ul.usps {
            list-style: none;
            margin: 0;
            padding: 1em 0 0;
            font-size: (12/14em);
            display: grid;
            grid-template-rows: repeat(auto-fill, minmax(1.2em, min-content));
            /* grid-template-columns: repeat(auto-fill, minmax(50%, max-content)); */
            grid-auto-flow: column;
            gap: .5em 2em;
            max-height: 10em;
            border-top: 1px solid fade(@coral-main-blue, 25%);
            >li {
                display: flex;
                &:before {
                    content: '\2022';
                    margin-right: .5em;
                    color: @coral-main-blue;
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
        @media screen and (max-width: @mobile-breakpoint) {
            width: 100%;
            border-left: 0;
            border-top: 1px solid fade(black, 10%);
        }
        .tour-type {
            width: 100%;
            display: flex;
            button {
                flex: 1;
                .interactive();
                background: transparent;
                font-size: inherit;
                line-height: 1;
                height: (32/14em);
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
                    margin-left: -1px;
                }
                &:first-of-type {
                    border-top-left-radius: .5em;
                    border-bottom-left-radius: .5em;
                }
                &:last-of-type {
                    border-top-right-radius: .5em;
                    border-bottom-right-radius: .5em;
                }
            }
        }
        .tour-info {
            display: flex;
            flex-direction: column;
            .transit(opacity, .25s);
            .transit(filter, .25s);
            @media screen and (max-width: @mobile-breakpoint) {
                gap: 1em;
            }
            &.blocked {
                pointer-events: none;
                opacity: .3;
                filter: blur(4px);
            }
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
                width: 100%;
                margin: auto;
                display: grid;
                grid-template-columns: 1fr auto;
                background: #FEEFCD;
                border-radius: .5em;
                padding: .5em .5em .5em 1em;
                cursor: pointer;
                .card-visual {
                    width: (81/14em);
                }
                .info {
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    .up-to {
                        font-size: (16/14em);
                        font-weight: 600;
                    }
                    .to-coral-bonus-card {
                        font-size: (12/14em);
                        display: flex;
                        align-items: center;
                        &:after {
                            content: '';
                            width: 1.5em;
                            height: 1.5em;
                            margin-left: .5em;
                            background: url("data-url:/site/coral/assets-inline/icon-help.svg") center / cover no-repeat;
                        }
                    }
                }
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

    &.slide-inout-enter-from, &.slide-inout-leave-to {
        opacity: 0;
        max-height: 0;
    }

}
</style>