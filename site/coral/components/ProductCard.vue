<script setup>
import { inject } from "vue";

const props = defineProps(['product']);

const { hotel, offers } = props.product;

const selectedDeparture = inject('selected-departure');

</script>

<template>
    <div class="product-card">
        <div class="visual-details">
            <div class="visual" :style="{ backgroundImage: `url(${ hotel.images[0].sizes.find(s => s.type===4).url })` }"></div>
            <div class="details">
                <div class="location">{{ hotel.locationSummary }}</div>
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