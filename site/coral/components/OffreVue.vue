<script setup>

import { computed, onMounted, provide, ref, watchEffect } from "vue";
import RegionSelect from "./RegionSelect.vue";
import { HotelContent } from "../../lib/b2c-api";

const props = defineProps({
    options: {
        type: Object,
        default: { groupBy: 'country', chartersOnly: true }
    },
    hotelsList: { type: Array, default: [] }
});

const regionOptions = ref([]);
const selectedRegion = ref();

watchEffect(async () => {
    const hotel_ids = props.hotelsList.map(hotel => typeof hotel === 'number' ? hotel : hotel.id);
    const { result: { hotels: hotel_list }  } = await HotelContent.ListHotels(hotel_ids);
    regionOptions.value = [...(new Set(hotel_list.map(h => h[`${ props.options.groupBy }Name`])))];
});

const departures = ref([]);
const selectedDeparture = ref({});

const matchedDepartures = computed(() => {
    return departures.value.filter(dep => {
        const pattern_input = departureInputPattern.value?.trim();
        if (pattern_input) {
            const words_uc = pattern_input.toUpperCase().split(/\s+/);
            const dep_name_words_uc = (dep.correctName || dep.name).toUpperCase().split(/\s+/);
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

const layoutMode = ref('');
provide('layout-mode', layoutMode);
onMounted(() => {
    const layout = matchMedia('(max-width:768px)');
    layout.addEventListener('change', e => layoutMode.value = e.matches ? 'mobile' : 'desktop');
    layoutMode.value = layout.matches ? 'mobile' : 'desktop';
});


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
    }

}

</style>
