<script setup>
import {Skeleton} from "app/components/ui/skeleton";
import ProductPriceBlock from "./ProductPriceBlock.vue";

defineProps({
	isHotelOnly: {
		type: Boolean,
		default: false
	},
	tourType: {
		type: String,
		default: 'package'
	},
	offerRequestState: {
		type: String,
		default: 'idle'
	},
	offer: {
		type: Object,
		required: true
	},
	offerListPriceFormatted: {
		type: String,
		default: ''
	},
	offerFinalPriceFormatted: {
		type: String,
		default: ''
	},
	offerHref: {
		type: String,
		required: true
	},
	isOpen: {
		type: Boolean,
		default: false
	}
});

</script>

<template>
	<div
		:class="[
			'product-marker-pricing pricing w-full flex-col justify-end gap-2',
			isOpen ? 'product-marker-pricing--open open flex' : 'product-marker-pricing--closed hidden'
		]"
	>
		<div class="product-marker-pricing__price price block">
			<template v-if="offerRequestState === 'loading'">
				<Skeleton
					v-if="offer.price.oldAmount"
					class="product-marker-pricing__skeleton sk product-marker-pricing__skeleton--list-price sk--list-price block h-[12px] w-[83px] rounded-[6px]"
				/>
				<Skeleton
					class="product-marker-pricing__skeleton sk product-marker-pricing__skeleton--final-price sk--final-price mt-1 block h-[45px] w-[147px] rounded-[6px]"
				/>
			</template>
			<template v-else>
				<ProductPriceBlock
						variant="marker"
						from-label="цена от"
						:old-price="offer.price.oldAmount ? offerListPriceFormatted : ''"
						:final-price="offerFinalPriceFormatted"
				/>
			</template>
		</div>
	</div>
</template>
