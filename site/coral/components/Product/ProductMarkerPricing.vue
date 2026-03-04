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
	<div class="pricing" :class="{ open: isOpen }">
		<div class="price">
			<template v-if="offerRequestState === 'loading'">
				<Skeleton v-if="offer.price.oldAmount" class="sk sk--list-price"/>
				<Skeleton class="sk sk--final-price"/>
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

<style scoped lang="less">
@import "../../common/css/layout";
@import "../../common/css/coral-colors";

.pricing {
	width: 100%;
	display: flex;
	flex-direction: column;
	gap: 8px;
	justify-content: flex-end;

	&.open {
		display: flex;
	}

	&:not(.open) {
		display: none;
	}

	.price {
		display: block;

		.sk {
			display: block;
			border-radius: .35em;
		}

		.sk--list-price {
			width: 5.2em;
			height: .72em;
		}

		.sk--final-price {
			width: 9.2em;
			height: 2.8em;
		}
	}
}
</style>
