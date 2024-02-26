<script setup>

import { PackageTourHotelProduct } from "../../lib/b2c-api";
import { onMounted } from "vue";

const props = defineProps({
    options: {
        type: Object,
        default: { groupBy: 'country', chartersOnly: true }
    },
    hotelsList: { type: Array, default: [] }
});


onMounted(() => {
    PackageTourHotelProduct.ListDepartureLocations();
});

</script>

<template>
    <div class="offre-vue">
        THE APP
    </div>
</template>

<style scoped>

</style>