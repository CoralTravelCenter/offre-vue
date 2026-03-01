import {computed, onMounted, ref, watchEffect} from "vue";
import {invoke, until, useElementVisibility, useEventListener} from "@vueuse/core";
import {HotelContent} from "../../lib/b2c-api";
import {hotelSearchTimeframes} from "../../lib/data-ops";

function resolveNextData() {
  let nextData;
  try {
    nextData = JSON.parse(document.getElementById('__NEXT_DATA__').textContent);
  } catch (error) {
    nextData = window.__NEXT_DATA__;
  }
  return nextData;
}

export function useOffreFilters({props, rootEl}) {
  const hotelsDirectory = ref([]);
  const regionOptions = ref([]);
  const selectedRegion = ref();

  const selectedTimeframe = ref();
  const timeframeOptions = computed(() => {
    return [...(new Set(hotelsDirectory.value.map(entry => entry.timeframes.map(tf => tf.key)).flat(Infinity)))];
  });
  const isTimeframeSelectable = computed(() => {
    return timeframeOptions.value.length > 1;
  });

  const hotelInfos = ref([]);
  const regionsDirectory = ref({});

  const departures = ref([]);
  const selectedDeparture = ref({});
  const selectedDepartureId = computed({
    get() {
      return selectedDeparture.value?.id ? String(selectedDeparture.value.id) : undefined;
    },
    set(value) {
      const nextDeparture = departures.value.find(dep => String(dep.id) === String(value));
      if (nextDeparture) {
        selectedDeparture.value = nextDeparture;
      }
    }
  });

  const isVisible = useElementVisibility(rootEl);
  const shownOnce = ref(false);

  invoke(async () => {
    await until(isVisible).toBe(true);
    shownOnce.value = true;
  });

  watchEffect(() => {
    hotelsDirectory.value = props.hotelsList.map(hotel => {
      const entry = {
        id: typeof hotel === 'number' ? hotel : hotel.id,
        timeframes: hotelSearchTimeframes(hotel, props.options)
      };
      if (hotel.onlyhotel) {
        entry.onlyhotel = hotel.onlyhotel;
      }
      return entry;
    });
  });

  watchEffect(() => {
    if (timeframeOptions.value.length) {
      selectedTimeframe.value = timeframeOptions.value[0];
    }
  });

  watchEffect((onCleanup) => {
    if (!shownOnce.value) {
      return;
    }

    let aborted = false;
    onCleanup(() => {
      aborted = true;
    });

    (async () => {
      const hotelIds = [...(new Set(props.hotelsList.map(hotel => typeof hotel === 'number' ? hotel : hotel.id)))];
      const {result: hotelsInfoResponse} = await HotelContent.ListHotelsInfo(hotelIds);

      if (aborted) {
        return;
      }

      const {hotels, countries, regions, areas, places} = hotelsInfoResponse;
      hotelInfos.value = hotels;
      regionsDirectory.value = {countries, regions, areas, places};

      const locationOptions = hotelsInfoResponse[props.options.groupBy] || {};
      regionOptions.value = [...(new Set(Object.entries(locationOptions).map(([id, {name}]) => name)))];

      if (props.options.regionsOrder) {
        regionOptions.value.sort((a, b) => {
          let aidx = props.options.regionsOrder.indexOf(a);
          if (aidx < 0) {
            aidx = Infinity;
          }
          let bidx = props.options.regionsOrder.indexOf(b);
          if (bidx < 0) {
            bidx = Infinity;
          }
          return aidx - bidx;
        });
      }

      if (props.options.preferRegion) {
        selectedRegion.value = props.options.preferRegion;
      } else {
        selectedRegion.value = props.options.wildcardOption ? '*' : regionOptions.value[0];
      }
    })();
  });

  const matchedHotelsDirectory = computed(() => {
    if (selectedRegion.value && selectedTimeframe.value && hotelInfos.value.length) {
      const regionKey = {
        countries: 'countryKey',
        regions: 'regionKey',
        areas: 'areaKey',
        places: 'placeKey'
      }[props.options.groupBy];

      return hotelsDirectory.value.filter(hotel => {
        const hotelInfo = hotelInfos.value.find(info => hotel.id == info.id);
        return !!hotelInfo
          && (selectedRegion.value === '*'
            || hotelInfo[regionKey] == [...Object.entries(regionsDirectory.value[props.options.groupBy])].find(([k, v]) => v.name === selectedRegion.value)[0])
          && (!isTimeframeSelectable.value || hotel.timeframes.some(tf => tf.key === selectedTimeframe.value));
      });
    }

    return [];
  });

  onMounted(() => {
    const nextData = resolveNextData();
    departures.value = nextData?.props?.pageProps?.meta?.departures || [];
    selectedDeparture.value = departures.value.find(d => d.isCurrent) || departures.value[0] || {};

    useEventListener(document, 'prefer-region', (event) => {
      selectedRegion.value = event.detail.regionName;
    });

    useEventListener(document, 'prefer-timeframe', (event) => {
      selectedTimeframe.value = event.detail.timeframeKey;
    });
  });

  return {
    regionOptions,
    selectedRegion,
    selectedTimeframe,
    timeframeOptions,
    isTimeframeSelectable,
    hotelInfos,
    matchedHotelsDirectory,
    departures,
    selectedDeparture,
    selectedDepartureId
  };
}
