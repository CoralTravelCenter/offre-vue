<script setup>
import ProductCard from "./ProductCard.vue";
import { computed, ref, watch } from "vue";

const props = defineProps(['products','inProgress']);

const showProgress = ref(false);
let showProgressTimeout;
watch(() => props.inProgress, (newValue, oldValue) => {
    console.log('+++ newValue, oldValue: %o, %o', newValue, oldValue);
    if (newValue && !oldValue) {
        showProgressTimeout = setTimeout(() => {
            showProgress.value = true;
        }, 300);
    } else {
        clearTimeout(showProgressTimeout);
        showProgress.value = false;
    }
});

const productListPageNumber = ref(1);
const productListPageSize = ref(10);
const pagedProductList = computed(() => {
    const start = (productListPageNumber.value-1) * productListPageSize.value;
    return props.products.slice(start, start + productListPageSize.value);
});


</script>

<template>
    <div class="product-grid">
        <Transition name="slide-inout">
            <el-progress v-if="inProgress && showProgress" :percentage="inProgress" :indeterminate="true" :show-text="false"></el-progress>
        </Transition>
        <div class="offers-list">
            <TransitionGroup name="slide-inout">
                <ProductCard v-for="product in pagedProductList" :product="product" :key="product.hotel.id"></ProductCard>
            </TransitionGroup>
        </div>
        <el-affix position="bottom" target=".product-grid">
            <div class="pager">
                <el-pagination v-model:current-page="productListPageNumber"
                               :total="products.length"
                               :page-size="productListPageSize"
                               layout="prev, pager, next"
                               background hide-on-single-page></el-pagination>
            </div>
        </el-affix>
    </div>
</template>

<style scoped lang="less">
@import "../common/css/layout";
.product-grid {
    display: grid;

    .offers-list {
        display: grid;
        gap: 1em;
    }

    .el-progress {
        overflow: hidden;
        max-height: 5em;
        .transit(opacity);
        .transit(max-height);
        &.slide-inout-enter-from, &.slide-inout-leave-to {
            opacity: 0;
            max-height: 0;
        }

    }

    .pager {
        display: grid;
        place-content: center;
        padding: 1em .5em;
        background: fade(white, 80%);
        backdrop-filter: blur(8px);
    }

}
</style>