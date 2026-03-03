<script setup>
import {computed} from "vue";

const props = defineProps({
  modelValue: {
    type: String,
    default: 'list'
  }
});

const emit = defineEmits(['update:modelValue']);

const isMapMode = computed(() => props.modelValue === 'map');

const ariaLabel = computed(() => {
  if (isMapMode.value) {
    return 'Показать список';
  }
  return 'Показать карту';
});

function toggleMode() {
  emit('update:modelValue', isMapMode.value ? 'list' : 'map');
}
</script>

<template>
  <div class="view-mode-toggle flex items-center justify-end">
    <button
        type="button"
        :aria-pressed="isMapMode"
        :aria-label="ariaLabel"
        :data-state="isMapMode ? 'on' : 'off'"
        :class="[
          'inline-flex h-10 w-10 items-center justify-center rounded-[8px] border bg-white transition-colors duration-200',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6eb8dd]',
          isMapMode
              ? 'border-[#0d98d9] text-[#0d98d9]'
              : 'border-[#d4d9df] text-[#1f2227]',
          'hover:border-[#0d98d9] hover:text-[#0d98d9]'
        ]"
        @click="toggleMode"
    >
      <svg v-if="isMapMode" class="h-5 w-5" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <path
            d="M15.556 1.667H4.444a2.78 2.78 0 0 0-2.777 2.777v11.112a2.78 2.78 0 0 0 2.777 2.777h11.112a2.78 2.78 0 0 0 2.777-2.777V4.444a2.78 2.78 0 0 0-2.777-2.777M4.444 2.777h11.112a1.67 1.67 0 0 1 1.666 1.667v2.693L2.778 5.074v-.63a1.67 1.67 0 0 1 1.666-1.666M2.778 15.557v-9.36l6.022.86-2.033 10.166H4.444a1.67 1.67 0 0 1-1.666-1.667m12.778 1.666H7.9L9.902 7.214l7.32 1.045v7.297a1.67 1.67 0 0 1-1.667 1.666"
            fill="currentColor"
            fill-opacity=".85"
        />
        <path
            d="M13.7 8.35a4 4 0 0 0-.734 0 3.4 3.4 0 0 0-2.06 1.019 3.25 3.25 0 0 0-.902 2.079c-.04.83.231 1.644.76 2.294l2.118 2.707a.56.56 0 0 0 .451.218.58.58 0 0 0 .451-.218l2.118-2.708c.53-.649.8-1.464.761-2.293a3.25 3.25 0 0 0-.902-2.08A3.4 3.4 0 0 0 13.7 8.352m1.3 4.717-1.667 2.13-1.666-2.13a2.28 2.28 0 0 1-.53-1.543 2.16 2.16 0 0 1 .587-1.38 2.25 2.25 0 0 1 1.357-.687 2.5 2.5 0 0 1 .504 0 2.25 2.25 0 0 1 1.357.686c.356.378.564.867.587 1.38.02.56-.168 1.109-.53 1.543"
            fill="currentColor"
            fill-opacity=".85"
        />
        <path
            d="M13.002 8.673q.33-.03.661 0v.001a3.06 3.06 0 0 1 1.863.92c.489.51.776 1.172.812 1.867v.001a3.05 3.05 0 0 1-.668 2.046l-.024.033-2.118 2.707a.255.255 0 0 1-.351.04l-.038-.04-2.118-2.707-.004-.005-.17-.227a3.05 3.05 0 0 1-.519-1.845c.036-.696.323-1.36.812-1.87a3.06 3.06 0 0 1 1.863-.92zm.046.46-.008.001a2.57 2.57 0 0 0-1.553.787 2.48 2.48 0 0 0-.675 1.588v.003c-.02.56.143 1.11.46 1.57l.145.193 1.66 2.122.256.327.256-.327 1.66-2.122a2.6 2.6 0 0 0 .604-1.763v-.003l-.019-.22a2.5 2.5 0 0 0-.655-1.369 2.57 2.57 0 0 0-1.553-.786h-.009l-.284-.014q-.143 0-.285.013Z"
            stroke="currentColor"
            stroke-width=".65"
            stroke-opacity=".85"
        />
        <path
            d="M13.333 12.5a.833.833 0 1 0 0-1.667.833.833 0 0 0 0 1.667"
            fill="currentColor"
            fill-opacity=".85"
        />
      </svg>
      <svg v-else class="h-5 w-5" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <path
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M3.125 12.292v4.583h13.75v-4.583zm-1.25-.125c0-.622.504-1.125 1.125-1.125h14c.621 0 1.125.503 1.125 1.125V17c0 .621-.504 1.125-1.125 1.125H3A1.125 1.125 0 0 1 1.875 17zm1.25-9.042v4.583h13.75V3.125zM1.875 3c0-.621.504-1.125 1.125-1.125h14c.621 0 1.125.504 1.125 1.125v4.833c0 .622-.504 1.125-1.125 1.125H3a1.125 1.125 0 0 1-1.125-1.125z"
            fill="currentColor"
        />
      </svg>
      <span class="sr-only">{{ ariaLabel }}</span>
    </button>
  </div>
</template>
