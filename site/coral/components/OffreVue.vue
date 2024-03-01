<script setup>

import { computed, getCurrentInstance, onMounted, provide, ref, watch, watchEffect } from "vue";
import RegionSelect from "./RegionSelect.vue";
import { HotelContent } from "../../lib/b2c-api";
import { commonSearchCriterias } from "../config/globals";
import { hotelSearchTimeframes } from "../../lib/data-ops";

import dayjs from "dayjs";
import locale_ru from 'dayjs/locale/ru'
dayjs.locale(locale_ru);

const props = defineProps({
    options: {
        type: Object,
        default: { groupBy: 'countries', chartersOnly: true }
    },
    hotelsList: { type: Array, default: [] }
});

const layoutMode = ref('');
provide('layout-mode', layoutMode);
onMounted(() => {
    const layout = matchMedia('(max-width:768px)');
    layout.addEventListener('change', e => layoutMode.value = e.matches ? 'mobile' : 'desktop');
    layoutMode.value = layout.matches ? 'mobile' : 'desktop';
});

const hotelsDirectory = ref([]);
watchEffect(() => {
    hotelsDirectory.value = props.hotelsList.map(hotel => {
        return {
            id: typeof hotel === 'number' ? hotel : hotel.id,
            timeframes: hotelSearchTimeframes(hotel, props.options),
        }
    });
    console.log('+++ hotelsDirectory: %o', hotelsDirectory.value);
});


const regionOptions = ref([]);
const selectedRegion = ref();

const selectedTimeframe = ref();
const timeframeOptions = computed(() => {
    return [...(new Set(hotelsDirectory.value.map(entry => entry.timeframes.map(tf => tf.key)).flat(Infinity)))];
});
const isTimeframeSelectable = computed(() => {
    return timeframeOptions.value.length > 1;
});
watchEffect(() => {
    if (timeframeOptions.value.length) {
        selectedTimeframe.value = timeframeOptions.value[0];
    }
});

const hotelInfos = ref([]);
const regionsDirectory = ref({});

watchEffect(async () => {
    const hotel_ids = [...(new Set(props.hotelsList.map(hotel => typeof hotel === 'number' ? hotel : hotel.id)))];
    const { result: hotels_info } = await HotelContent.ListHotelsInfo(hotel_ids);
    const { hotels, countries, regions, areas, places } = hotels_info;
    hotelInfos.value = hotels;
    regionsDirectory.value = { countries, regions, areas, places };
    const location_options = hotels_info[props.options.groupBy];
    regionOptions.value = [...(new Set(Object.entries(location_options).map(([id, { name }]) => name)))];

    // const offersQuery = Object.assign({}, commonSearchCriterias, {
    //     beginDates: [],
    //     nights: [],
    //     departureLocations: [selectedDeparture.value],
    //     arrivalLocations: hotelInfos.value.map(info => ({ id: info.location.id, type: info.location.type })),
    //     paging: { pageNumber: 1, pageSize: hotelInfos.value.length, sortType: 0 },
    //     flightType: props.options.chartersOnly ? 0 : 2
    // });
    // console.log('+++ offersQuery: %o', offersQuery);

});

const matchingHotelsDirectory = computed(() => {
    if (selectedRegion.value && selectedTimeframe.value && hotelInfos.value.length) {
        const region_key = {
            countries: 'countryKey',
            regions:   'regionKey',
            areas:     'areaKey',
            places:    'placeKey'
        }[props.options.groupBy];
        return hotelsDirectory.value.filter(hotel => {
            const hotel_info = hotelInfos.value.find(info => hotel.id == info.id);
            return (selectedRegion.value === '*'
                    || hotel_info[region_key] == [...Object.entries(regionsDirectory.value[props.options.groupBy])].find(([k, v]) => v.name === selectedRegion.value)[0])
                && (!isTimeframeSelectable.value || hotel.timeframes.some(tf => tf.key === selectedTimeframe.value));
        });
    } else {
        return [];
    }
});

const departures = ref([]);
const selectedDeparture = ref({});

const matchedDepartures = computed(() => {
    const { $cityCorrectName } = getCurrentInstance().appContext.config.globalProperties;
    return departures.value.filter(dep => {
        const pattern_input = departureInputPattern.value?.trim();
        if (pattern_input) {
            const words_uc = pattern_input.toUpperCase().split(/\s+/);
            const dep_name_words_uc = ($cityCorrectName(dep.name)).toUpperCase().split(/\s+/);
            return words_uc.reduce((matched, word) => {
                if (!matched) return false;
                const idx = dep_name_words_uc.findIndex(dep_word => dep_word.indexOf(word) === 0);
                if (~idx) {
                    dep_name_words_uc.splice(idx, 1);
                    return true;
                }
                return false;
            }, true);
        }
        return true;
    });
});
const departureInputPattern = ref();



onMounted(async () => {

    const next_data = JSON.parse(document.getElementById('__NEXT_DATA__').textContent);

    departures.value = next_data.props.pageProps.meta.departures;
    selectedDeparture.value = departures.value.find(d => d.isCurrent);

});

</script>

<template>
    <div class="offre-vue">
        <div class="controls">
            <RegionSelect v-model="selectedRegion"
                          :options-list="regionOptions"
                          :wildcard-option="options.wildcardOption"></RegionSelect>

            <el-select v-model="selectedDeparture"
                       value-key="id"
                       filterable
                       default-first-option
                       :filter-method="input => departureInputPattern = input"
                       :teleported="true">
                <template #empty><div style="text-align:center; padding: 1em;">Не найден</div></template>
                <el-option v-for="departure in matchedDepartures"
                           :size="layoutMode.value === 'mobile' ? 'small' : 'default'"
                           :key="departure.id"
                           :label="`из ${ $cityGenitiveCase(departure.name) }`"
                           :value="departure">
                    <span>{{ $cityCorrectName(departure.name) }}</span>
                </el-option>
            </el-select>

            <el-select v-if="isTimeframeSelectable"
                       v-model="selectedTimeframe">
                <el-option v-for="timeframe in timeframeOptions"
                           :size="layoutMode.value === 'mobile' ? 'small' : 'default'"
                           :key="timeframe"
                           :label="timeframe"
                           :value="timeframe">
                </el-option>
            </el-select>
        </div>
        <div class="console">
            <ul>
                <li v-for="hotel in matchingHotelsDirectory">
                    {{ hotel }}
                </li>
            </ul>
        </div>
    </div>
</template>

<style lang="less">
@import "../common/css/coral-colors";

:root {
    --el-font-family: inherit!important;
    //--el-font-size-base: inherit!important;
    --el-font-size-base: 1em!important;
    --el-component-size: 2.5em!important;
    --el-fill-color-light: fade(@coral-main-blue, 8%)!important;
    --el-color-primary: @coral-main-blue;
}

.el-select-dropdown, .el-progress-bar {
    font-family: inherit;
    //font-weight: 400;
    --el-color-primary: @coral-main-blue;
    //--el-text-color-regular: black;
}

.offre-vue {
    .el-select {
        --el-select-width: unset;
        --el-select-border-color-hover: @coral-main-blue;
        .el-input__wrapper {
            --el-input-border-color: @coral-page-bg;
            box-shadow: inset 0 0 0 2px var(--el-input-border-color);
        }
        .el-select__wrapper {
            font-size: unset;
        }
    }
}

</style>
<style scoped lang="less">
@import "../common/css/layout";

.offre-vue {
    //max-width: 1120px;
    margin-left: auto;
    margin-right: auto;

    .bbox();
    //.silly-b2c-font-size(@max-font-size: 14px);
    font-weight: normal;
    display: grid;
    gap: 1em;

    .controls {
        display: flex;
        align-items: center;
        gap: 1em;
        .el-select {
            flex: 0 0 auto;
        }
    }

}

</style>
