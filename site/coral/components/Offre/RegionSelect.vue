<script setup>
import {computed, nextTick, onMounted, ref, watch} from "vue";
import {useResizeObserver, useScroll} from "@vueuse/core";
import {Skeleton} from "app/components/ui/skeleton";

const model = defineModel({
  type: [String, Number],
  default: undefined
});

const props = defineProps({
  wildcardOption: [Boolean, String],
  loading: {
    type: Boolean,
    default: false
  },
  optionsList: {
    type: Array,
    default: () => []
  }
});

const $scroller = ref();
const hasInitialScrollSync = ref(false);
const {arrivedState, measure} = useScroll($scroller);

const hasRightFade = computed(() => {
  if (!$scroller.value) {
    return false;
  }
  return !arrivedState.right;
});

const selectedValue = computed(() => {
  return model.value == null ? undefined : String(model.value);
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

async function selectOption(value) {
  model.value = String(value);
}

function scrollToValue(value, behavior = "smooth") {
  const container = $scroller.value;
  if (!value || !container) {
    return;
  }
  const activeItem = [...container.children]
      .find((element) => element.dataset.value === value);
  if (!activeItem) {
    measure();
    return;
  }
  activeItem.scrollIntoView({behavior, inline: 'start', block: 'nearest'});
  measure();
}

watch(
    [selectedValue, availableValues],
    async ([value, values]) => {
      if (!value || !values.includes(value)) {
        measure();
        return;
      }
      await nextTick();
      scrollToValue(value, hasInitialScrollSync.value ? 'smooth' : 'auto');
      hasInitialScrollSync.value = true;
    },
    {immediate: true}
);

onMounted(() => {
  measure();
});

useResizeObserver($scroller, () => {
  measure();
});

</script>

<template>
  <div
      class="region-select-shell relative mt-2 min-w-0 after:pointer-events-none after:absolute after:inset-y-0 after:right-0 after:z-1 after:w-1/5 after:opacity-0 after:transition-opacity after:duration-200 after:ease-in-out after:content-[''] after:bg-[linear-gradient(to_left,#FFFFFF_0%,rgba(234,243,251,0)_100%)] lg:mt-0"
      :class="{ 'after:opacity-100': hasRightFade }"
  >
    <div
        v-if="loading"
        class="region-select-skeleton region-select-skeleton--loading flex items-center gap-2 overflow-hidden px-2"
        aria-hidden="true"
    >
      <Skeleton
          class="region-select-skeleton__item region-select-skeleton__item--active block h-9.5 min-w-0 flex-[1_1_0] rounded-3xl"/>
      <Skeleton class="region-select-skeleton__item block h-9.5 min-w-0 flex-[1_1_0] rounded-3xl"/>
      <Skeleton class="region-select-skeleton__item block h-9.5 min-w-0 flex-[1_1_0] rounded-3xl"/>
      <Skeleton class="region-select-skeleton__item block h-9.5 min-w-0 flex-[1_1_0] rounded-3xl"/>
    </div>

    <ul
        v-else
        ref="$scroller"
        class="region-select region-select__list m-0 flex list-none items-center overflow-x-scroll px-2 scroll-px-2 [scrollbar-width:none] [-ms-overflow-style:none] snap-x snap-mandatory [&::-webkit-scrollbar]:hidden"
    >
      <li
          v-if="wildcardOption"
          class="region-select__item region-select__item--option shrink-0 cursor-pointer rounded-3xl px-5 py-3 text-[14px] snap-start"
          data-value="*"
          :class="{ 'region-select__item--selected bg-primary text-primary-foreground': selectedValue === '*' }"
          @click="selectOption('*')"
      >
        {{ tidyLabel(wildcardOption) }}
      </li>
      <li
          v-for="option in optionsList"
          :key="option"
          class="region-select__item region-select__item--option shrink-0 cursor-pointer rounded-3xl px-5 py-3 text-[14px] snap-start"
          :data-value="String(option)"
          :class="{ 'region-select__item--selected bg-primary text-primary-foreground': selectedValue === String(option) }"
          @click="selectOption(option)"
      >
        {{ tidyLabel(option) }}
      </li>
    </ul>
  </div>
</template>
