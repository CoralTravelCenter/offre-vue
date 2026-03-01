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
  <a target="_blank" :href="props.offerHref" class="block relative">
    <img v-if="imageUrl" :src="imageUrl" :alt="props.hotel?.name || ''"
         class="block w-full h-50 rounded-[12px] object-cover">
    <div class="absolute top-2.5 left-2.5 badges-grid">
      <Badge v-if="props.hotel.recommended" variant="default" class="custom-badge bg-white text-black">
        Рекомендуем
      </Badge>
      <Badge v-if="props.hotel.exclusive" variant="default" class="custom-badge bg-[#E84F0E] text-white">
        Эксклюзив
      </Badge>
    </div>
  </a>
</template>

<style lang="less" scoped>
.badges-grid {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.custom-badge {
  font-size: 12px;
  padding-block: 4px;
  padding-inline: 8px;
  border-radius: 12px;
}
</style>