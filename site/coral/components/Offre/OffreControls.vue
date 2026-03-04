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
const emit = defineEmits(['request-map-mode']);

const {breakpointKey} = useViewportBreakpoints();

function setGridViewMode(mode) {
	if (gridViewModeModel.value === mode) {
		return;
	}

	// Сбрасываем выбранный маркер при переходе в режим карты.
	if (mode === 'map') {
		emit('request-map-mode');
	}
	gridViewModeModel.value = mode;
}

function capitalizeFirst(value) {
	const text = String(value ?? "").trim();
	if (!text) {
		return "";
	}
	return text[0].toLocaleUpperCase() + text.slice(1);
}
</script>

<template>
	<div class="controls"
			 :class="{ 'controls--without-timeframe': !isTimeframeSelectable, 'controls--loading': regionsLoading }"
			 :data-breakpoint="breakpointKey">
		<RegionSelect class="controls__region" v-model="selectedRegionModel"
									:loading="regionsLoading"
									:options-list="regionOptions"
									:wildcard-option="wildcardOption"></RegionSelect>

		<div v-if="regionsLoading" class="controls__departure controls__slot-skeleton">
			<Skeleton class="controls__skeleton controls__skeleton--select"/>
		</div>
		<Select v-else v-model="selectedDepartureIdModel">
			<SelectTrigger size="3" class="controls__departure capitalize h-10 bg-white shadow-none">
				<svg v-show="!breakpointKey" class="control-icon control-icon--flight" viewBox="0 0 20 20" fill="none"
						 aria-hidden="true">
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
				<SelectValue placeholder="Город вылета" class="min-w-0 max-w-full grow basis-0 truncate"/>
			</SelectTrigger>
			<SelectContent>
				<SelectItem v-for="departure in departures"
										:key="departure.id"
										:value="String(departure.id)"
										:text-value="capitalizeFirst($cityCorrectName(departure.name))">
					{{ capitalizeFirst($cityCorrectName(departure.name)) }}
				</SelectItem>
			</SelectContent>
		</Select>

		<div v-if="regionsLoading && isTimeframeSelectable" class="controls__timeframe controls__slot-skeleton">
			<Skeleton class="controls__skeleton controls__skeleton--select"/>
		</div>
		<Select v-else-if="isTimeframeSelectable" v-model="selectedTimeframeModel">
			<SelectTrigger size="3" class="controls__timeframe capitalize h-10 bg-white shadow-none">
				<svg v-show="!breakpointKey" class="control-icon control-icon--calendar" viewBox="0 0 18 16" fill="none"
						 aria-hidden="true">
					<rect x=".5" y="1.667" width="16.667" height="13.333" rx="2" stroke="currentColor" stroke-linejoin="round"/>
					<path d="M.5 3.667a2 2 0 0 1 2-2h12.667a2 2 0 0 1 2 2v2.166H.5z" stroke="currentColor"
								stroke-linejoin="round"/>
					<path d="M3 2.917V0m5.833 2.917V0m5.834 2.917V0" stroke="currentColor"/>
				</svg>
				<SelectValue placeholder="Период"/>
			</SelectTrigger>
			<SelectContent>
				<SelectItem v-for="timeframe in timeframeOptions"
										:key="timeframe"
										:value="timeframe">
					{{ capitalizeFirst(timeframe) }}
				</SelectItem>
			</SelectContent>
		</Select>

		<div v-if="regionsLoading" class="controls__view-mode controls__slot-skeleton">
			<Skeleton class="controls__skeleton controls__skeleton--toggle"/>
		</div>
		<ViewModeToggle v-else class="controls__view-mode" v-model="gridViewModeModel"/>

	</div>
</template>

<style scoped lang="less">
@import "../../common/css/coral-colors";

.controls__region {
	grid-area: region;
	min-width: 0;
	margin-inline: -8px;
}

.controls__departure {
	grid-area: departure;
	width: 100%;
	min-width: 0;
}

.controls__timeframe {
	grid-area: timeframe;
	width: 100%;
	min-width: 0;
}

.controls__view-mode {
	grid-area: view-mode;
	justify-self: end;
}

.controls {
	background: transparent;
	display: grid;
	padding-inline: 8px;
	row-gap: 8px;
	column-gap: 8px;
	grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) auto;
	grid-template-rows: auto auto;
	grid-template-areas:
  "region region region"
  "departure timeframe view-mode";
	align-items: center;

	&.controls--without-timeframe {
		grid-template-columns: minmax(0, 1fr) auto;
		grid-template-areas:
    "region region"
    "departure view-mode";
	}

	&.controls--loading {
		grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) auto;
		grid-template-areas:
    "region region region"
    "departure timeframe view-mode";
	}

	&.controls--loading.controls--without-timeframe {
		grid-template-columns: minmax(0, 1fr) auto;
		grid-template-areas:
    "region region"
    "departure view-mode";
	}

	.control-icon {
		display: inline-flex;
		width: 20px;
		height: 20px;
		color: #535353;
		flex: 0 0 20px;
	}

	.control-icon--calendar {
		width: 18px;
		flex-basis: 18px;
	}

	&.controls--loading {
		pointer-events: none;
	}
}

@media screen and (min-width: 1024px) {
	.controls__region {
		margin-inline: 0;
	}

	.controls {
		padding-inline: 0;
		grid-template-columns: minmax(0, 1fr) minmax(150px, 220px) minmax(150px, 220px) auto;
		grid-template-rows: auto;
		grid-template-areas: "region departure timeframe view-mode";
	}

	.controls.controls--without-timeframe {
		grid-template-columns: minmax(0, 1fr) minmax(150px, 220px) auto;
		grid-template-rows: auto;
		grid-template-areas: "region departure view-mode";
	}

	.controls.controls--loading {
		grid-template-columns: minmax(0, 1fr) minmax(150px, 220px) minmax(150px, 220px) auto;
		grid-template-rows: auto;
		grid-template-areas: "region departure timeframe view-mode";
	}

	.controls.controls--loading.controls--without-timeframe {
		grid-template-columns: minmax(0, 1fr) minmax(150px, 220px) auto;
		grid-template-rows: auto;
		grid-template-areas: "region departure view-mode";
	}
}

.controls__slot-skeleton {
	min-width: 0;
}

.controls__skeleton {
	border-radius: 8px;
}

.controls__skeleton--select {
	width: 100%;
	height: 40px;
}

.controls__skeleton--toggle {
	width: 40px;
	height: 40px;
}
</style>
