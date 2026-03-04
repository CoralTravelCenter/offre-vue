<script setup>
import ProductLocation from "./ProductLocation.vue";
import ProductRatingStars from "./ProductRatingStars.vue";
import ProductHotelName from "./ProductHotelName.vue";

defineProps({
	hotel: {
		type: Object,
		required: true
	},
	offer: {
		type: Object,
		required: true
	},
	offerHref: {
		type: String,
		required: true
	},
	beginDate: {
		type: String,
		required: true
	},
	selectedDepartureName: {
		type: String,
		default: ''
	},
	hotelCategoryName: {
		type: String,
		default: ''
	},
	hotelStarCount: {
		type: Number,
		default: 0
	},
	mealType: {
		type: String,
		default: ''
	},
	hotelUspsList: {
		type: Array,
		default: () => []
	}
});

const emit = defineEmits(['location-click']);

function handleLocationClick(hotel) {
	emit('location-click', hotel);
}
</script>

<template>
	<div class="details">
		<ProductLocation
				class="location"
				:value="hotel.locationSummary"
				:clickable="true"
				:has-coordinates="!!hotel.coordinates"
				variant="card"
				@click="handleLocationClick(hotel)"
		/>

		<ProductHotelName :offer-href="offerHref" :name="hotel.name"/>

		<div class="category-concept">
			<ProductRatingStars v-if="hotelStarCount" :count="hotelStarCount" variant="card"/>
			<span v-else class="category-name">{{ hotelCategoryName }}</span>
			<div class="concepts">
				<span v-if="hotel.eliteHotel" class="elite-service-badge"><span>ELITE SERVICE</span></span>
				<span v-if="hotel.sunFamilyClub || hotel.coralFamilyClub" class="cfc-badge"></span>
			</div>
		</div>

		<ul class="terms">
			<li v-if="offer.flight" class="departure">из {{ $cityGenitiveCase(selectedDepartureName) }}</li>
			<li class="begin-date">{{ beginDate }}</li>
			<li class="stay-nights">{{ offer.stayNights }} {{ offer.stayNights.asNights() }}</li>
			<li class="meal-type">{{ mealType }}</li>
		</ul>

		<ul v-if="hotelUspsList?.length" class="usps">
			<li v-for="usp in hotelUspsList" :key="usp">{{ usp }}</li>
		</ul>
	</div>
</template>

<style scoped lang="less">
@import "../../common/css/coral-colors";
@import "../../common/css/layout";

.details {
	display: flex;
	flex-direction: column;
	justify-content: flex-start;
	padding: 8px 0;
}

.details .category-concept {
	display: flex;
	align-items: center;
	gap: 8px;
	margin-bottom: 8px;
}

.details .category-name {
	color: @coral-main-yellow;
}

.details .concepts {
	display: flex;
	align-items: center;
	gap: 8px;
}

.details .elite-service-badge {
	display: inline-grid;
	place-content: center;
	height: 24px;
	padding: 0 12px;
	line-height: 1;
	font-size: 12px;
	font-weight: 300;
	color: white;
	border-radius: 6px;
	background-color: #333;
}

.details .elite-service-badge > span {
	font-size: 12px;
}

.details .cfc-badge {
	display: block;
	aspect-ratio: 153/35;
	height: 24px;
	font-size: 20px;
	background: url("data-url:/site/coral/assets-inline/coral-family-club.svg") center / cover no-repeat;
}

.details .hotel-name {
	color: unset;
	text-decoration: none;
	margin-bottom: 4px;
}

.details .hotel-name:hover {
	text-decoration: underline;
}

.details .name {
	font-size: 20px;
	font-weight: 700;
}

.details .terms {
	display: flex;
	flex-wrap: wrap;
	align-items: baseline;
	gap: 4px;
	margin: 0;
	padding: 0;
	list-style: none;
	font-size: 12px;
}

.details .terms > li {
	display: inline-flex;
	align-items: center;
}

.details .terms > li::before {
	content: '';
	height: 1em;
	margin-right: 4px;
	background: center / contain no-repeat;
}

.details .terms > li.departure::before {
	width: 22px;
	background-image: url(data-url:/site/coral/assets-inline/icon-flight.svg);
}

.details .terms > li.begin-date::before {
	width: 14px;
	background-image: url(data-url:/site/coral/assets-inline/icon-cal.svg);
}

.details .terms > li.stay-nights::before {
	width: 17px;
	background-image: url(data-url:/site/coral/assets-inline/icon-bed.svg);
}

.details .terms > li.meal-type::before {
	width: 19px;
	background-image: url(data-url:/site/coral/assets-inline/icon-meal.svg);
}

.details .usps {
	display: grid;
	grid-auto-flow: column;
	grid-template-rows: repeat(auto-fill, minmax(16px, min-content));
	gap: 4px 16px;
	max-height: 137px;
	margin: 0;
	padding: 8px 0 0;
	list-style: none;
	font-size: 14px;
	border-top: 1px solid fade(@coral-main-blue, 25%);
}

.details .usps > li {
	display: flex;
}

.details .usps > li::before {
	content: '\2022';
	margin-right: 6px;
	color: @coral-main-blue;
}

@media screen and (min-width: 1280px) {
	.details {
		justify-content: center;
		gap: 0;
	}

	.details .location,
	.details .hotel-name,
	.details .category-concept,
	.details .terms,
	.details .usps {
		margin: 0;
	}

	.details .hotel-name {
		margin-bottom: 8px;
	}

	.details .usps {
		padding-top: 0;
		border-top: 0;
	}

	.details .terms {
		margin-top: 16px;
		margin-bottom: 16px;
	}

	.details .usps {
		display: block;
		font-size: 12px;
		padding-left: 8px;
	}

	.details .usps > li::before {
		color: #000000;
	}
}
</style>
