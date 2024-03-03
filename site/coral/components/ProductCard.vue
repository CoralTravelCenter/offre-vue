<script setup>
import { inject } from "vue";

const props = defineProps(['product']);

const { hotel, offers } = props.product;

const selectedDeparture = inject('selected-departure');
const { getReferenceValueByKey } = inject('product-reference');

const { name: hotelCategoryName, starCount: hotelStarCount } = getReferenceValueByKey('hotelCategories', hotel.categoryKey);

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
                    <li class="departure">из {{ $cityGenitiveCase(selectedDeparture.name) }}</li>
                </ul>
            </div>
        </div>
        <div class="pricing">
            {{ offers[0].price.amount }}
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
            list-style: none;
            margin: 0;
            padding: 0;
            font-weight: 300;
        }
    }
    .pricing {
        width: 30%;
        border-left: 1px solid fade(black, 10%);
    }

    overflow: hidden;
    max-height: 20em;
    .transit(opacity);
    .transit(max-height);
    &.slide-inout-enter-from, &.slide-inout-leave-to {
        opacity: 0;
        max-height: 0;
    }

}
</style>