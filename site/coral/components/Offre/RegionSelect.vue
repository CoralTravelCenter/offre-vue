<script setup>
import {computed, nextTick, onMounted, onUnmounted, ref, watch} from "vue";

const props = defineProps({
  modelValue: [String, Number],
  wildcardOption: [Boolean, String],
  optionsList: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(['update:modelValue']);
const scroller = ref();
const hasLeftFade = ref(false);
const hasRightFade = ref(false);

const selectedValue = computed(() => {
  return props.modelValue == null ? undefined : String(props.modelValue);
});

const availableValues = computed(() => {
  const values = props.optionsList.map((option) => String(option));
  if (props.wildcardOption) {
    return ['*', ...values];
  }
  return values;
});

function tidyLabel(value) {
  return String(value ?? '').replace(/\s*\(.+?\)/, '');
}

function syncScrollFade() {
  const element = scroller.value;
  if (!element) {
    hasLeftFade.value = false;
    hasRightFade.value = false;
    return;
  }

  const maxScrollLeft = element.scrollWidth - element.clientWidth;
  if (maxScrollLeft <= 1) {
    hasLeftFade.value = false;
    hasRightFade.value = false;
    return;
  }

  hasLeftFade.value = element.scrollLeft > 1;
  hasRightFade.value = element.scrollLeft < maxScrollLeft - 1;
}

async function selectOption(value) {
  const nextValue = String(value);
  emit('update:modelValue', nextValue);

  await nextTick();
  scrollToValue(nextValue);
}

function scrollToValue(value, behavior = "smooth") {
  if (!value) return;
  const activeItem = [...(scroller.value?.children ?? [])]
      .find((element) => element.dataset.value === value);
  activeItem?.scrollIntoView({behavior, block: 'nearest', inline: 'start'});
  requestAnimationFrame(syncScrollFade);
}

watch(
    [selectedValue, availableValues],
    async ([value, values]) => {
      if (!value || !values.includes(value)) {
        requestAnimationFrame(syncScrollFade);
        return;
      }
      await nextTick();
      scrollToValue(value, 'auto');
    },
    {immediate: true}
);

onMounted(() => {
  syncScrollFade();
  window.addEventListener('resize', syncScrollFade);
});

onUnmounted(() => {
  window.removeEventListener('resize', syncScrollFade);
});

</script>

<template>
  <div class="region-select-shell" :class="{ 'has-left-fade': hasLeftFade, 'has-right-fade': hasRightFade }">
    <ul ref="scroller" class="region-select" @scroll.passive="syncScrollFade">
      <li
          class="region-select__item"
          v-if="wildcardOption"
          data-value="*"
          :class="{ selected: selectedValue === '*' }"
          @click="selectOption('*')"
      >
        {{ tidyLabel(wildcardOption) }}
      </li>
      <li
          class="region-select__item"
          v-for="option in optionsList"
          :key="option"
          :data-value="String(option)"
          :class="{ selected: selectedValue === String(option) }"
          @click="selectOption(option)"
      >
        {{ tidyLabel(option) }}
      </li>
    </ul>
  </div>
</template>

<style scoped lang="less">
@import "../../common/css/coral-colors";

.region-select-shell {
  position: relative;
  min-width: 0;

  &::before,
  &::after {
    content: "";
    position: absolute;
    top: 0;
    bottom: 0;
    width: 24px;
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.2s ease;
    z-index: 1;
  }

  &::before {
    left: 0;
    background: linear-gradient(to right, #EAF3FB 0%, rgba(234, 243, 251, 0) 100%);
  }

  &::after {
    right: 0;
    background: linear-gradient(to left, #EAF3FB 0%, rgba(234, 243, 251, 0) 100%);
  }

  &.has-left-fade::before {
    opacity: 1;
  }

  &.has-right-fade::after {
    opacity: 1;
  }
}

.region-select {
  display: flex;
  align-items: center;
  list-style: none;
  margin: 0;
  padding: 0 8px;
  overflow-x: scroll;
  scroll-snap-type: x mandatory;
  scrollbar-width: none;
  -ms-overflow-style: none;
  scroll-padding-inline: 8px;

  &::-webkit-scrollbar {
    display: none;
  }
}

.region-select__item {
  padding: 12px 20px;
  border-radius: 24px;
  font-size: 14px;
  cursor: pointer;
  scroll-snap-align: start;

  &.selected {
    color: white;
    background-color: @coral-main-blue;
  }
}
</style>
