<script setup>
import RegionSelect from "./RegionSelect.vue";
import ViewModeToggle from "./ViewModeToggle.vue";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "app/components/ui/select";
import {Skeleton} from "app/components/ui/skeleton";
import {useViewportBreakpoints} from "app/composables/useViewportBreakpoints";

const props = defineProps({
  regionOptions: {
    type: Array,
    default: () => []
  },
  regionsLoading: {
    type: Boolean,
    default: false
  },
  wildcardOption: {
    type: [Boolean, String],
    default: false
  },
  departures: {
    type: Array,
    default: () => []
  },
  timeframeOptions: {
    type: Array,
    default: () => []
  },
  isTimeframeSelectable: {
    type: Boolean,
    default: false
  }
});

const selectedRegionModel = defineModel('selectedRegion', {
  type: [String, Number],
  default: undefined
});
const selectedDepartureIdModel = defineModel('selectedDepartureId', {
  type: [String, Number],
  default: undefined
});
const selectedTimeframeModel = defineModel('selectedTimeframe', {
  type: String,
  default: undefined
});
const gridViewModeModel = defineModel('gridViewMode', {
  type: String,
  default: 'list'
});

const {breakpointKey} = useViewportBreakpoints();

function capitalizeFirst(value) {
  const text = String(value ?? "").trim();
  if (!text) {
    return "";
  }
  return text[0].toLocaleUpperCase() + text.slice(1);
}
</script>

<template>
  <div
      class="offre-controls controls grid items-center gap-2 px-2 min-[1024px]:px-0"
      :class="{
			'grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] grid-rows-[auto_auto] min-[1024px]:grid-cols-[minmax(0,1fr)_minmax(150px,220px)_minmax(150px,220px)_auto] min-[1024px]:grid-rows-[auto]': isTimeframeSelectable,
			'grid-cols-[minmax(0,1fr)_auto] grid-rows-[auto_auto] min-[1024px]:grid-cols-[minmax(0,1fr)_minmax(150px,220px)_auto] min-[1024px]:grid-rows-[auto]': !isTimeframeSelectable,
			'controls--without-timeframe': !isTimeframeSelectable,
			'controls--loading pointer-events-none': regionsLoading
		}"
      :data-breakpoint="breakpointKey"
  >
    <RegionSelect
        class="offre-controls__region controls__region col-span-full row-1 min-w-0 -mx-2 min-[1024px]:col-1 min-[1024px]:row-1 min-[1024px]:mx-0"
        v-model="selectedRegionModel"
        :loading="regionsLoading"
        :options-list="regionOptions"
        :wildcard-option="wildcardOption"
    />

    <div v-if="regionsLoading"
         class="offre-controls__slot-skeleton controls__departure col-1 row-2 min-w-0 min-[1024px]:col-2 min-[1024px]:row-1">
      <Skeleton class="offre-controls__skeleton offre-controls__skeleton--select h-10 w-full rounded-xl"/>
    </div>
    <Select v-else v-model="selectedDepartureIdModel">
      <SelectTrigger
          size="3"
          class="offre-controls__trigger offre-controls__trigger--departure controls__departure col-1 row-2 h-10 w-full min-w-0 bg-white capitalize shadow-none min-[1024px]:col-2 min-[1024px]:row-1"
      >
        <svg
            v-show="!breakpointKey"
            class="offre-controls__icon offre-controls__icon--flight inline-flex h-5 w-5 shrink-0 text-foreground/70"
            viewBox="0 0 20 20"
            fill="none"
            aria-hidden="true"
        >
          <path
              d="m7.5 5 1.294-2.588a1.348 1.348 0 0 1 2.412 0L12.5 5l-1.563 12.506a.944.944 0 0 1-1.874 0z"
              stroke="currentColor"
              stroke-linejoin="round"
          />
          <path
              d="M7.5 5.833 1.667 8.75v2.5h6.25M12.5 5.833l5.834 2.917v2.5h-6.25M8.75 15.833 5 16.667v1.666h5m1.25-2.5 3.75.834v1.666h-5"
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
          />
        </svg>
        <SelectValue placeholder="Город вылета"
                     class="offre-controls__trigger-value min-w-0 max-w-full grow basis-0 truncate"/>
      </SelectTrigger>
      <SelectContent>
        <SelectItem
            v-for="departure in departures"
            :key="departure.id"
            class="offre-controls__option"
            :value="String(departure.id)"
            :text-value="capitalizeFirst($cityCorrectName(departure.name))"
        >
          {{ capitalizeFirst($cityCorrectName(departure.name)) }}
        </SelectItem>
      </SelectContent>
    </Select>

    <div v-if="regionsLoading && isTimeframeSelectable"
         class="offre-controls__slot-skeleton controls__timeframe col-2 row-2 min-w-0 min-[1024px]:col-3 min-[1024px]:row-1">
      <Skeleton class="offre-controls__skeleton offre-controls__skeleton--select h-10 w-full rounded-xl"/>
    </div>
    <Select v-else-if="isTimeframeSelectable" v-model="selectedTimeframeModel">
      <SelectTrigger
          size="3"
          class="offre-controls__trigger offre-controls__trigger--timeframe controls__timeframe col-2 row-2 h-10 w-full min-w-0 bg-white capitalize shadow-none min-[1024px]:col-3 min-[1024px]:row-1"
      >
        <svg
            v-show="!breakpointKey"
            class="offre-controls__icon offre-controls__icon--calendar inline-flex h-4.5 w-4.5 shrink-0 basis-4.5 text-foreground/70"
            viewBox="0 0 18 16"
            fill="none"
            aria-hidden="true"
        >
          <rect x=".5" y="1.667" width="16.667" height="13.333" rx="2" stroke="currentColor" stroke-linejoin="round"/>
          <path d="M.5 3.667a2 2 0 0 1 2-2h12.667a2 2 0 0 1 2 2v2.166H.5z" stroke="currentColor"
                stroke-linejoin="round"/>
          <path d="M3 2.917V0m5.833 2.917V0m5.834 2.917V0" stroke="currentColor"/>
        </svg>
        <SelectValue placeholder="Период"/>
      </SelectTrigger>
      <SelectContent>
        <SelectItem
            v-for="timeframe in timeframeOptions"
            :key="timeframe"
            class="offre-controls__option"
            :value="timeframe"
        >
          {{ capitalizeFirst(timeframe) }}
        </SelectItem>
      </SelectContent>
    </Select>

    <div
        v-if="regionsLoading"
        class="offre-controls__slot-skeleton controls__view-mode row-2 min-w-0 justify-self-end"
        :class="isTimeframeSelectable ? 'col-3 min-[1024px]:col-4 min-[1024px]:row-1' : 'col-2 min-[1024px]:col-3 min-[1024px]:row-1'"
    >
      <Skeleton class="offre-controls__skeleton offre-controls__skeleton--toggle h-10 w-10 rounded-xl"/>
    </div>
    <ViewModeToggle
        v-else
        class="offre-controls__view-mode controls__view-mode row-2 justify-self-end"
        :class="isTimeframeSelectable ? 'col-3 min-[1024px]:col-4 min-[1024px]:row-1' : 'col-2 min-[1024px]:col-3 min-[1024px]:row-1'"
        v-model="gridViewModeModel"
    />

  </div>
</template>
