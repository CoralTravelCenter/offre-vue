<script setup>
import { useMouseInElement, useResizeObserver, useScroll } from "@vueuse/core";
import { inject, ref, watchEffect } from "vue";

const props = defineProps({
    modelValue: String,
    wildcardOption: String,
    optionsList: Array
});

const $el = ref();

const emit = defineEmits(['update:modelValue']);

const layoutMode = inject('layout-mode');

function selectOptionEl(el) {
    el.classList.add('selected');
    [...el.parentNode.children].filter(n => n !== el).forEach(n => n.classList.remove('selected'));
    emit('update:modelValue', el.dataset.value);
}

watchEffect(() => {
    const li = $el.value?.querySelector(`li[data-value="${ props.modelValue }"]`);
    if (li) selectOptionEl(li);
});

const vTidy = {
    mounted(el) {
        el.textContent = el.textContent.replace(/\s*\(.+?\)/, '');
    }
}

const scroller = ref();
const { elementX: mouse_x, isOutside: mouseOut } = useMouseInElement(scroller);
useResizeObserver(scroller, (entries) => {

});
const { x: scroll_x } = useScroll(scroller, { behavior: 'auto' });

watchEffect(() => {
    if (layoutMode.value === 'desktop' && scroller.value) {
        const li = [...scroller.value.children];
        const left_gap = li.at(0).clientWidth;
        const rightGap = li.at(-1).clientWidth;
        const hover_area_width = scroller.value.clientWidth - left_gap - rightGap;
        let target_scroll_ratio = (mouse_x.value - left_gap) / hover_area_width;
        if (target_scroll_ratio < 0) target_scroll_ratio = 0.0;
        if (target_scroll_ratio > 1) target_scroll_ratio = 1.0;
        const scroll_span = scroller.value.scrollWidth - scroller.value.clientWidth;
        scroll_x.value = Math.round(scroll_span * target_scroll_ratio);
    }
});

</script>

<template>
    <div class="region-select" ref="$el">
        <ul ref="scroller">
            <li v-if="wildcardOption" data-value="*" @click="modelValue='*'" v-tidy>{{ wildcardOption }}</li>
            <li v-for="option in optionsList" :data-value="option" @click="modelValue=option" v-tidy>{{ option }}</li>
        </ul>
    </div>
</template>

<style scoped lang="less">
@import "../common/css/coral-colors";
@import "../common/css/layout";
.region-select {
    //flex: 1 1 auto;
    background: fade(@coral-main-blue, 5%);
    border-radius: 100px;
    @media screen and (max-width: @mobile-breakpoint) {
        grid-column: 1 / span 2;
    }
    @media screen and (max-width: @narrow-breakpoint) {
        grid-column: 1;
    }
    ul {
        display: flex;
        align-items: center;
        list-style: none;
        padding: 0;
        margin: 0;
        overflow-x: auto;
        &::-webkit-scrollbar {
            display: none;
        }
        >li {
            .interactive();
            flex: 1 1 auto;
            line-height: 1;
            height: 2.45em;
            padding: 0 1em;
            display: inline-grid;
            place-content: center;
            cursor: pointer;
            border-radius: 100px;
            white-space: nowrap;
            text-align: center;
            .transit(color, .25s);
            .transit(background, .25s);
            &.selected {
                position: sticky;
                left: 0;
                right: 0;
                pointer-events: none;
                color: white;
                background-color: @coral-main-blue;
            }
        }
    }
}
</style>