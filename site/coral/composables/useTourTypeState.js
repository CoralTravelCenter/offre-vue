import {computed, ref, unref, watch} from "vue";

export function useTourTypeState({
  hotelIdKey,
  sharedTourTypeByHotelId,
  defaultTourType = 'package'
}) {
  const localTourType = ref(defaultTourType);
  const sharedTourTypeSource = computed(() => unref(sharedTourTypeByHotelId) || null);

  const tourType = computed({
    get() {
      const hotelKey = hotelIdKey.value;
      const sharedState = sharedTourTypeSource.value;
      if (hotelKey && sharedState && typeof sharedState[hotelKey] === 'string') {
        return sharedState[hotelKey];
      }
      return localTourType.value;
    },
    set(value) {
      const nextValue = value === 'hotel' ? 'hotel' : 'package';
      localTourType.value = nextValue;

      const hotelKey = hotelIdKey.value;
      const sharedState = sharedTourTypeSource.value;
      if (hotelKey && sharedState) {
        sharedState[hotelKey] = nextValue;
      }
    }
  });

  watch(hotelIdKey, (hotelKey, prevHotelKey) => {
    const sharedState = sharedTourTypeSource.value;
    if (!hotelKey) {
      return;
    }
    if (hotelKey !== prevHotelKey) {
      // При переходе на другой отель начинаем с дефолтного package,
      // чтобы состояние "только отель" не переезжало между карточками.
      localTourType.value = defaultTourType;
    }
    if (!sharedState) {
      return;
    }
    if (typeof sharedState[hotelKey] !== 'string') {
      // Инициализируем общее состояние для отеля текущим локальным значением.
      sharedState[hotelKey] = localTourType.value;
    }
  }, {immediate: true});

  return {
    tourType
  };
}
