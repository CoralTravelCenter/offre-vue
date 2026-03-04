<script setup>
import {computed} from "vue";
import {Badge} from '../ui/badge'

const props = defineProps({
  hotel: {
    type: Object,
    required: true
  },
  offerHref: {
    type: String,
    required: true
  }
});

const imageUrl = computed(() => {
  const sizes = props.hotel?.images?.[0]?.sizes ?? [];
  return sizes.find((size) => size.type === 4)?.url ?? sizes[0]?.url ?? '';
});
</script>

<template>
  <a
      target="_blank"
      :href="props.offerHref"
      class="product-card-visual relative block xl:h-full xl:min-h-[240px]"
  >
    <img
        v-if="imageUrl"
        :src="imageUrl"
        :alt="props.hotel?.name || ''"
        class="product-card-visual__image block h-[200px] w-full rounded-[12px] object-cover xl:h-full xl:min-h-[240px]"
    >
    <div class="product-card-visual__badges badge-grid absolute left-2.5 top-2.5 flex flex-col gap-2">
      <Badge
          v-if="props.hotel.recommended"
          variant="default"
          class="product-card-visual__badge product-card-visual__badge--recommended rounded-[12px] bg-white px-2 py-1 text-[12px] text-black"
      >
        Рекомендуем
      </Badge>
      <Badge
          v-if="props.hotel.exclusive"
          variant="default"
          class="product-card-visual__badge product-card-visual__badge--exclusive rounded-[12px] bg-coral-exclusive px-2 py-1 text-[12px] text-white"
      >
        Эксклюзив
      </Badge>
    </div>
  </a>
</template>
