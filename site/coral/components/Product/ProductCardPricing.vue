<script setup>
import {computed, onBeforeUnmount, ref, watch} from "vue";
import {Popover, PopoverContent, PopoverTrigger} from "app/components/ui/popover";
import {Button} from "app/components/ui/button";
import {Skeleton} from "app/components/ui/skeleton";
import ProductPriceBlock from "./ProductPriceBlock.vue";
import ProductTourTypeSwitch from "./ProductTourTypeSwitch.vue";
import {useViewportBreakpoints} from "app/composables/useViewportBreakpoints";

const tourTypeModel = defineModel('tourType', {
	type: String,
	default: 'package'
});

const props = defineProps({
	isHotelOnly: {
		type: Boolean,
		default: false
	},
	isEliteHotel: {
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

const {isLg, isXl, isXxl} = useViewportBreakpoints();
const isDesktopPopoverHoverMode = computed(() => {
	return isLg.value || isXl.value || isXxl.value;
});
const isCashbackPopoverOpen = ref(false);
let cashbackPopoverCloseTimer = null;

function clearCashbackPopoverCloseTimer() {
	if (cashbackPopoverCloseTimer) {
		clearTimeout(cashbackPopoverCloseTimer);
		cashbackPopoverCloseTimer = null;
	}
}

function openCashbackPopover() {
	clearCashbackPopoverCloseTimer();
	isCashbackPopoverOpen.value = true;
}

function scheduleCashbackPopoverClose() {
	clearCashbackPopoverCloseTimer();
	cashbackPopoverCloseTimer = setTimeout(() => {
		isCashbackPopoverOpen.value = false;
		cashbackPopoverCloseTimer = null;
	}, 90);
}

function handleCashbackPopoverOpenChange(nextOpen) {
	isCashbackPopoverOpen.value = nextOpen;
}

function handleCashbackTriggerEnter() {
	if (!isDesktopPopoverHoverMode.value) {
		return;
	}
	openCashbackPopover();
}

function handleCashbackTriggerLeave() {
	if (!isDesktopPopoverHoverMode.value) {
		return;
	}
	scheduleCashbackPopoverClose();
}

function handleCashbackContentEnter() {
	if (!isDesktopPopoverHoverMode.value) {
		return;
	}
	openCashbackPopover();
}

function handleCashbackContentLeave() {
	if (!isDesktopPopoverHoverMode.value) {
		return;
	}
	scheduleCashbackPopoverClose();
}

watch(isDesktopPopoverHoverMode, (isDesktop) => {
	if (!isDesktop) {
		clearCashbackPopoverCloseTimer();
		isCashbackPopoverOpen.value = false;
	}
});

onBeforeUnmount(() => {
	clearCashbackPopoverCloseTimer();
});

</script>

<template>
	<div
			class="product-card-pricing pricing flex w-full flex-col gap-2 border-t border-coral-stroke-soft pt-2 min-[1280px]:h-full min-[1280px]:justify-start min-[1280px]:gap-4 min-[1280px]:border-l min-[1280px]:border-coral-stroke-soft min-[1280px]:border-t-0 min-[1280px]:pl-3 min-[1280px]:pt-0"
			:style="{
				'--product-card-discount-bg': props.isEliteHotel ? '#B6985B' : '#52C41A',
				'--product-card-discount-fold': props.isEliteHotel ? '#8F7342' : '#389E0D'
			}"
	>
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
				<div class="product-card-pricing__price price flex flex-col gap-1 whitespace-nowrap leading-none">
					<Skeleton
					/>
					<Skeleton v-if="props.offer.price.oldAmount"
										class="product-card-pricing__sk product-card-pricing__sk--old sk block h-3 w-27 rounded-[6px]"/>
					<Skeleton
							class="product-card-pricing__sk product-card-pricing__sk--final sk block h-7 w-39 rounded-[6px]"/>
				</div>
				<Skeleton
						v-if="props.offer.price.discountPercent"
						class="product-card-pricing__sk product-card-pricing__sk--badge sk absolute bottom-0 right-1 h-6 w-23.5 translate-x-5.5 rounded-[6px_6px_0_6px]"
				/>
			</div>
			<div v-if="props.cashbackInfo"
					 class="product-card-pricing__cashback cashback cashback--skeleton grid w-full grid-cols-[1fr_auto] rounded-lg bg-[#F3F4F6] px-2 py-1.5 text-left">
				<div class="product-card-pricing__cashback-info info flex flex-col justify-center">
					<Skeleton
							class="product-card-pricing__sk product-card-pricing__sk--up-to sk block h-3.5 w-46 rounded-[6px]"/>
					<Skeleton
							class="product-card-pricing__sk product-card-pricing__sk--bonus sk mt-1 block h-3 w-35.5 rounded-[6px]"/>
				</div>
				<Skeleton
						class="product-card-pricing__sk product-card-pricing__sk--card sk h-8.25 w-13.5 self-center rounded-[6px]"/>
			</div>
			<Skeleton class="product-card-pricing__sk product-card-pricing__sk--button sk h-12 w-full rounded-lg"/>
		</div>

		<div v-else
				 class="product-card-pricing__tour-info tour-info flex flex-col gap-2 min-[1280px]:mt-auto min-[1280px]:basis-auto min-[1280px]:justify-start min-[1280px]:gap-4">
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
						class="product-card-pricing__discount pricing-discount__discount absolute bottom-0 right-1 grid h-6 translate-x-5.5 place-content-center rounded-[6px_6px_0_6px] bg-[var(--product-card-discount-bg)] px-3 text-[12px] leading-none text-white"
				>
					{{ props.offer.price.discountPercent }}% Скидка
				</div>
			</div>

			<Popover
					v-if="props.cashbackInfo"
					:open="isDesktopPopoverHoverMode ? isCashbackPopoverOpen : undefined"
					@update:open="handleCashbackPopoverOpenChange"
			>
				<PopoverTrigger as-child>
					<!-- Entire cashback banner acts as popover trigger. -->
					<button
							type="button"
							class="product-card-pricing__cashback cashback cashback-trigger m-0 grid w-full cursor-pointer grid-cols-[1fr_auto] rounded-lg border-0 bg-coral-cashback px-2 py-1.5 text-left text-inherit appearance-none font-inherit outline-none transition-[filter] duration-150 hover:brightness-[0.98] active:brightness-[0.95] focus:outline-none focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
							aria-label="Показать условия кешбэка CoralBonus"
							@mouseenter="handleCashbackTriggerEnter"
							@mouseleave="handleCashbackTriggerLeave"
					>
						<div class="product-card-pricing__cashback-info info flex flex-col justify-center">
              <span class="product-card-pricing__cashback-up-to up-to text-[14px] font-semibold">Кешбэк до {{
									props.cashbackInfo?.finalBonus?.formatCurrency?.() ?? ''
								}}</span>
							<span class="product-card-pricing__cashback-label to-coral-bonus-card flex items-center text-[12px]">на карту CoralBonus</span>
						</div>
						<img
								class="product-card-pricing__cashback-card card-visual cashback-card-pulse h-8.25 w-13.5 self-center object-cover origin-center will-change-[transform,filter] motion-reduce:animate-none"
								src="https://b2ccdn.coral.ru/content/cb_24.png" alt="">
					</button>
				</PopoverTrigger>
				<PopoverContent
						side="top"
						align="center"
						:align-offset="0"
						class="offre-vue-cashback-popover-content offre-shadow-ring w-[min(var(--reka-popover-trigger-width),calc(100vw-32px))] max-w-[calc(100vw-32px)] border-0 rounded-xl px-3 py-0 outline-none focus:outline-none focus-visible:outline-none focus-visible:ring-0"
						show-arrow
						:arrow-width="16"
						:arrow-height="8"
						arrow-rounded
						arrow-class="fill-white stroke-none"
						@mouseenter="handleCashbackContentEnter"
						@mouseleave="handleCashbackContentLeave"
				>
					<div class="offre-vue-cashback-popover">
						<div class="promos-grid flex flex-col text-[12px] font-semibold">
							<div
									class="promo-row inline-flex items-center gap-8 border-b border-[rgba(204,214,228,0.60)] py-3 text-balance min-[768px]:max-[1279px]:grid min-[768px]:max-[1279px]:grid-cols-[auto_minmax(0,1fr)] min-[768px]:max-[1279px]:items-start min-[768px]:max-[1279px]:gap-x-4 min-[768px]:max-[1279px]:gap-y-3"
									v-for="promo in (props.cashbackInfo?.listOfPromos ?? [])"
									:key="promo.content_txt">
								<span class="value text-left">{{ promo.content_result?.formatCurrency?.() ?? '' }}</span>
								<a v-if="promo.content_link" :href="promo.content_link"
									 class="description cursor-pointer text-right underline decoration-1 underline-offset-2 transition-colors duration-150 hover:text-primary active:text-primary/80 focus:outline-none focus-visible:outline-none focus-visible:ring-0 min-[768px]:max-[1279px]:min-w-0 min-[768px]:max-[1279px]:text-wrap"
									 target="_blank">{{ promo.content_txt }}</a>
								<span v-else
											class="description text-left min-[768px]:max-[1279px]:min-w-0 min-[768px]:max-[1279px]:text-wrap">{{
										promo.content_txt
									}}</span>
							</div>
							<div
									class="info-action inline-flex items-center justify-between gap-4 py-3 text-balance min-[768px]:max-[1279px]:grid min-[768px]:max-[1279px]:grid-cols-[minmax(0,1fr)_auto] min-[768px]:max-[1279px]:items-center">
								<div class="info">Для начисления бонусов, укажите номер карты в&nbsp;поле "Примечание к&nbsp;заказу"
								</div>
								<a href="https://coralbonus.ru/registration?promo=R3R5VO93GKG8N1PGQC1UP0G6EICQLRWEN3Z64WZGC4YBYIKHFJV55IND5O20WUJ"
									 class="action inline-flex h-8 cursor-pointer items-center justify-center rounded-lg bg-primary px-3 py-1.5 text-primary-foreground transition-colors duration-150 hover:bg-primary/90 active:bg-primary/80 focus:outline-none focus-visible:outline-none focus-visible:ring-0"
									 target="_blank">Активировать</a>
							</div>
						</div>
					</div>
				</PopoverContent>
			</Popover>

			<Button
					as="a"
					:href="props.offerHref"
					variant="coral"
					:class="[
						'product-card-pricing__choose-button do-choose block h-12 shrink-0 cursor-pointer rounded-lg p-3.25 text-center text-[16px] leading-[1.3] no-underline',
						props.isEliteHotel
							? 'bg-black! text-white! hover:bg-black/90! active:bg-black/80!'
							: 'bg-primary! text-primary-foreground! hover:bg-primary/90! active:bg-primary/80!'
					]"
					target="_blank"
			>Выбрать
			</Button>
		</div>
	</div>
</template>

<style lang="less">
.product-card-pricing .pricing-discount__discount::after {
	content: '';
	position: absolute;
	top: 100%;
	right: 0;
	width: 10px;
	height: 7px;
	background: linear-gradient(to bottom right, var(--product-card-discount-fold) 50%, transparent 55%);
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
		filter: drop-shadow(0 0 6px rgba(0, 147, 208, 0.30));
	}
	90% {
		transform: scale(1);
		filter: none;
	}
	92% {
		transform: scale(1.03);
		filter: drop-shadow(0 0 5px rgba(0, 147, 208, 0.24));
	}
	94% {
		transform: scale(1);
		filter: none;
	}
}
</style>
