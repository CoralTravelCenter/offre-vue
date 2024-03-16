<script setup>
import ProductCard from "./ProductCard.vue";
import { computed, inject, ref, watch, watchEffect } from "vue";
import { v4 as uuid_v4 } from 'uuid';
import { toValue, useElementSize, useParentElement } from "@vueuse/core";

const instance_uuid = uuid_v4();

const props = defineProps(['products','inProgress']);

const $el = ref();

const layoutMode = inject('layout-mode');

const showProgress = ref(false);
let showProgressTimeout;

watchEffect(() => {
    if (props.inProgress) {
        if (!showProgressTimeout) {
            showProgressTimeout = setTimeout(() => showProgress.value = true);
        }
    } else {
        clearTimeout(showProgressTimeout);
        showProgressTimeout = null;
        showProgress.value = false;
    }
});

const productListPageNumber = ref(1);
const productListPageSize = ref(10);
const pagedProductList = computed(() => {
    const start = (productListPageNumber.value-1) * productListPageSize.value;
    return props.products.slice(start, start + productListPageSize.value);
});

const pagerAffix = ref();
watch(pagedProductList, () => {
    setTimeout(() => {
        pagerAffix.value?.update();
        pagerAffix.value?.updateRoot();
    }, 501);
});

let widgetWidth = ref();
watchEffect(() => {
    if ($el.value) {
        widgetWidth = useElementSize($el.value.closest('.offre-vue')).width;
    }
});
watchEffect(() => {
    if ($el.value) {
        $el.value.style.fontSize = (toValue(widgetWidth.value) / 1370) * 14 + 'px';
    }
});

</script>

<template>
    <div ref="$el" class="product-grid" :data-instance-uuid="instance_uuid">
        <Transition name="slide-inout">
            <el-progress v-if="inProgress && showProgress" :percentage="inProgress" :indeterminate="true" :show-text="false"></el-progress>
        </Transition>
        <div class="offers-list">
            <TransitionGroup name="slide-inout">
                <ProductCard v-for="product in pagedProductList" :product="product" :key="product.hotel.id"></ProductCard>
            </TransitionGroup>
        </div>
        <el-affix ref="pagerAffix" position="bottom" :offset="layoutMode === 'mobile' ? 64 : 0" :target="`[data-instance-uuid='${ instance_uuid }']`">
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
    display: flex;
    flex-direction: column;
    @media screen and (max-width: @mobile-breakpoint) {
        font-size: 2vw!important;
    }
    @media screen and (max-width: @narrow-breakpoint) {
        font-size: 2.5vw!important;
    }
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
        border-radius: 1em 1em 0 0;
        &:not(:has(.el-pagination)) {
            display: none;
        }
    }

}
</style>