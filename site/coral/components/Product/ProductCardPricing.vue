<script setup>
import {Popover, PopoverContent, PopoverTrigger} from "app/components/ui/popover";
import {Button} from "app/components/ui/button";
import {Skeleton} from "app/components/ui/skeleton";
import ProductPriceBlock from "./ProductPriceBlock.vue";
import ProductTourTypeSwitch from "./ProductTourTypeSwitch.vue";

const tourTypeModel = defineModel('tourType', {
	type: String,
	default: 'package'
});

const props = defineProps({
	isHotelOnly: {
		type: Boolean,
		default: false
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
	cashbackInfo: {
		type: Object,
		default: undefined
	},
	offerHref: {
		type: String,
		required: true
	}
});

</script>

<template>
	<div class="product-card-pricing pricing flex w-full flex-col gap-2 border-t border-coral-stroke-soft pt-2 min-[1280px]:h-full min-[1280px]:justify-start min-[1280px]:gap-4 min-[1280px]:border-l min-[1280px]:border-coral-stroke-soft min-[1280px]:border-t-0 min-[1280px]:pl-3 min-[1280px]:pt-0">
		<ProductTourTypeSwitch
			class="product-card-pricing__tour-switch"
			v-model="tourTypeModel"
			:is-hotel-only="isHotelOnly"
		/>

		<div
			v-if="props.offerRequestState === 'loading'"
			class="product-card-pricing__tour-info-skeleton tour-info-skeleton flex flex-col gap-2 min-[1280px]:mt-auto min-[1280px]:basis-auto min-[1280px]:justify-start min-[1280px]:gap-4"
			aria-hidden="true"
		>
			<div class="product-card-pricing__price-discount price-discount relative grid grid-cols-[1fr_auto] items-end">
				<div class="product-card-pricing__price price flex flex-col whitespace-nowrap leading-none">
					<Skeleton class="product-card-pricing__sk product-card-pricing__sk--from sk block h-[10px] w-[72px] rounded-[6px]"/>
					<Skeleton v-if="props.offer.price.oldAmount" class="product-card-pricing__sk product-card-pricing__sk--old sk block h-3 w-[108px] rounded-[6px]"/>
					<Skeleton class="product-card-pricing__sk product-card-pricing__sk--final sk block h-7 w-[156px] rounded-[6px]"/>
				</div>
				<Skeleton
					v-if="props.offer.price.discountPercent"
					class="product-card-pricing__sk product-card-pricing__sk--badge sk absolute bottom-0 right-1 h-6 w-[94px] translate-x-[22px] rounded-[6px_6px_0_6px]"
				/>
			</div>
			<div v-if="props.cashbackInfo" class="product-card-pricing__cashback cashback cashback--skeleton grid w-full grid-cols-[1fr_auto] rounded-[8px] bg-coral-cashback px-2 py-[6px] text-left">
				<div class="product-card-pricing__cashback-info info flex flex-col justify-center">
					<Skeleton class="product-card-pricing__sk product-card-pricing__sk--up-to sk block h-[14px] w-[184px] rounded-[6px]"/>
					<Skeleton class="product-card-pricing__sk product-card-pricing__sk--bonus sk mt-1 block h-3 w-[142px] rounded-[6px]"/>
				</div>
				<Skeleton class="product-card-pricing__sk product-card-pricing__sk--card sk h-[33px] w-[54px] self-center rounded-[6px]"/>
			</div>
			<Skeleton class="product-card-pricing__sk product-card-pricing__sk--button sk h-12 w-full rounded-[8px]"/>
		</div>

		<div v-else class="product-card-pricing__tour-info tour-info flex flex-col gap-2 min-[1280px]:mt-auto min-[1280px]:basis-auto min-[1280px]:justify-start min-[1280px]:gap-4">
			<div class="product-card-pricing__price-discount price-discount relative grid grid-cols-[1fr_auto] items-end">
				<div class="product-card-pricing__price price flex flex-col whitespace-nowrap leading-none">
					<ProductPriceBlock
						variant="card"
						from-label="цена от:"
						:old-price="props.offer.price.oldAmount ? props.offerListPriceFormatted : ''"
						:final-price="props.offerFinalPriceFormatted"
					/>
				</div>
				<div
					v-if="props.offer.price.discountPercent"
					class="product-card-pricing__discount pricing-discount__discount absolute bottom-0 right-1 grid h-6 translate-x-[22px] place-content-center rounded-[6px_6px_0_6px] bg-coral-success px-3 text-[12px] leading-none text-white"
				>
					{{ props.offer.price.discountPercent }}% Скидка
				</div>
			</div>

			<Popover v-if="props.cashbackInfo">
				<PopoverTrigger as-child>
					<!-- Entire cashback banner acts as popover trigger. -->
					<button
						type="button"
						class="product-card-pricing__cashback cashback cashback-trigger m-0 grid w-full grid-cols-[1fr_auto] rounded-[8px] border-0 bg-coral-cashback px-2 py-[6px] text-left text-inherit [appearance:none] font-inherit cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-primary/45 focus-visible:ring-offset-2"
						aria-label="Показать условия кешбэка CoralBonus"
					>
						<div class="product-card-pricing__cashback-info info flex flex-col justify-center">
							<span class="product-card-pricing__cashback-up-to up-to text-[14px] font-semibold">Кешбэк до {{ props.cashbackInfo?.finalBonus?.formatCurrency?.() ?? '' }}</span>
							<span class="product-card-pricing__cashback-label to-coral-bonus-card flex items-center text-[12px]">на карту CoralBonus</span>
						</div>
						<img class="product-card-pricing__cashback-card card-visual cashback-card-pulse h-[33px] w-[54px] self-center object-cover [transform-origin:center] [will-change:transform,filter] motion-reduce:animate-none" src="https://b2ccdn.coral.ru/content/cb_24.png" alt="">
					</button>
				</PopoverTrigger>
				<PopoverContent
					side="top"
					align="center"
					:align-offset="0"
					class="offre-vue-cashback-popover-content offre-shadow-ring w-max max-w-[calc(100vw-32px)] border-0 rounded-xl px-3 py-0 min-[768px]:max-[1279px]:w-[min(560px,calc(100vw-32px))]"
					show-arrow
					:arrow-width="16"
					:arrow-height="8"
					arrow-rounded
					arrow-class="fill-white stroke-none"
				>
					<div class="offre-vue-cashback-popover">
						<div class="promos-grid flex flex-col text-[12px] font-semibold">
							<div
									 class="promo-row inline-flex items-center gap-8 border-b border-[rgba(204,214,228,0.60)] py-3 [text-wrap:balance] min-[768px]:max-[1279px]:grid min-[768px]:max-[1279px]:grid-cols-[auto_minmax(0,1fr)] min-[768px]:max-[1279px]:items-start min-[768px]:max-[1279px]:gap-x-4 min-[768px]:max-[1279px]:gap-y-3"
									 v-for="promo in (props.cashbackInfo?.listOfPromos ?? [])"
									 :key="promo.content_txt">
								<span class="value text-left">{{ promo.content_result?.formatCurrency?.() ?? '' }}</span>
								<a v-if="promo.content_link" :href="promo.content_link" class="description text-right underline min-[768px]:max-[1279px]:min-w-0 min-[768px]:max-[1279px]:[text-wrap:wrap]"
									 target="_blank">{{ promo.content_txt }}</a>
								<span v-else class="description text-left min-[768px]:max-[1279px]:min-w-0 min-[768px]:max-[1279px]:[text-wrap:wrap]">{{ promo.content_txt }}</span>
							</div>
							<div class="info-action inline-flex items-center justify-between gap-4 py-3 [text-wrap:balance] min-[768px]:max-[1279px]:grid min-[768px]:max-[1279px]:grid-cols-[minmax(0,1fr)_auto] min-[768px]:max-[1279px]:items-center">
								<div class="info">Для начисления бонусов, укажите номер карты в&nbsp;поле "Примечание к&nbsp;заказу"
								</div>
								<a href="https://coralbonus.ru/registration?promo=R3R5VO93GKG8N1PGQC1UP0G6EICQLRWEN3Z64WZGC4YBYIKHFJV55IND5O20WUJ"
									 class="action rounded-[8px] bg-primary px-3 py-1.5 text-primary-foreground" target="_blank">Активировать</a>
							</div>
						</div>
					</div>
				</PopoverContent>
			</Popover>

			<Button
				as="a"
				:href="props.offerHref"
				class="product-card-pricing__choose-button do-choose block h-12 shrink-0 rounded-[8px] bg-primary p-[13px] text-center text-[16px] leading-[1.3] text-primary-foreground no-underline"
				target="_blank"
			>Выбрать</Button>
		</div>
	</div>
</template>

<style lang="less">
@import "../../common/css/coral-colors";

.product-card-pricing .pricing-discount__discount::after {
	content: '';
	position: absolute;
	top: 100%;
	right: 0;
	width: 10px;
	height: 7px;
	background: linear-gradient(to bottom right, darken(#52C41A, 10%) 50%, transparent 55%);
}

.product-card-pricing .cashback .cashback-card-pulse {
	animation: cashback-card-pulse 10s ease-in-out infinite;
}

@keyframes cashback-card-pulse {
	0%, 86%, 100% {
		transform: scale(1);
		filter: none;
	}
	88% {
		transform: scale(1.04);
		filter: drop-shadow(0 0 6px fade(@coral-main-blue, 30%));
	}
	90% {
		transform: scale(1);
		filter: none;
	}
	92% {
		transform: scale(1.03);
		filter: drop-shadow(0 0 5px fade(@coral-main-blue, 24%));
	}
	94% {
		transform: scale(1);
		filter: none;
	}
}
</style>
