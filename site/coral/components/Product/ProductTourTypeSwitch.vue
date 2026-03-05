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
		class="product-tour-type-switch w-full"
		type="single"
		variant="outline"
		v-model="selectedValue"
	>
		<ToggleGroupItem
			v-if="!isHotelOnly"
			variant="outline"
			class="product-tour-type-switch__item product-tour-type-switch__item--package flex-1 cursor-pointer transition-colors duration-150 hover:bg-primary/5 active:bg-primary/10 data-[state=on]:bg-transparent data-[state=on]:text-primary data-[state=on]:border-primary"
			value="package"
		>
			Тур с перелетом
		</ToggleGroupItem>
		<ToggleGroupItem
			variant="outline"
			class="product-tour-type-switch__item product-tour-type-switch__item--hotel flex-1 cursor-pointer transition-colors duration-150 hover:bg-primary/5 active:bg-primary/10 data-[state=on]:bg-transparent data-[state=on]:text-primary data-[state=on]:border-primary"
			value="hotel"
		>
			Только отель
		</ToggleGroupItem>
	</ToggleGroup>
</template>
