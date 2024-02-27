<script setup>
const props = defineProps({
    modelValue: String,
    wildcardOption: String,
    optionsList: Array
});

const emit = defineEmits(['update:modelValue']);

function selectOptionEl(el) {
    el.classList.add('selected');
    [...el.parentNode.children].filter(n => n !== el).forEach(n => n.classList.remove('selected'));
    emit('update:modelValue', el.dataset.value);
}

const vTidy = {
    mounted(el) {
        el.textContent = el.textContent.replace(/\s*\(.+?\)/, '');
    }
}

</script>

<template>
    <div class="region-select">
        <ul>
            <li v-if="wildcardOption" data-value="*" @click="selectOptionEl($event.target)" v-tidy>{{ wildcardOption }}</li>
            <li v-for="option in optionsList" :data-value="option" @click="selectOptionEl($event.target)" v-tidy>{{ option }}</li>
        </ul>
    </div>
</template>

<style scoped lang="less">
@import "../common/css/coral-colors";
@import "../common/css/layout";
.region-select {
    ul {
        display: flex;
        align-items: center;
        list-style: none;
        padding: 0;
        margin: 0;
        overflow-x: auto;
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