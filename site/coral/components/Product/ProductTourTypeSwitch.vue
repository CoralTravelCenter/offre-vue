<script setup>
import {computed} from "vue";
import {ToggleGroup, ToggleGroupItem} from "app/components/ui/toggle-group";

const model = defineModel({
	type: String,
	default: 'package'
});

const props = defineProps({
	isHotelOnly: {
		type: Boolean,
		default: false
	}
});

const selectedValue = computed({
	get() {
		return props.isHotelOnly ? 'hotel' : model.value;
	},
	set(value) {
		if (!value || value === model.value) {
			return;
		}
		model.value = value;
	}
});
</script>

<template>
	<ToggleGroup
			class="w-full"
			type="single"
			variant="outline"
			v-model="selectedValue"
	>
		<ToggleGroupItem
				v-if="!isHotelOnly"
				class="flex-1 data-[state=on]:bg-transparent data-[state=on]:text-[#0092D0] data-[state=on]:border-[#0092D0]"
				value="package"
		>
			Тур с перелетом
		</ToggleGroupItem>
		<ToggleGroupItem
				class="flex-1 data-[state=on]:bg-transparent data-[state=on]:text-[#0092D0] data-[state=on]:border-[#0092D0]"
				value="hotel"
		>
			Только отель
		</ToggleGroupItem>
	</ToggleGroup>
</template>
