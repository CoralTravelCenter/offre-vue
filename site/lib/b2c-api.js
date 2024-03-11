import { consultApi } from "./b2c-api-adapter";

export const PackageTourHotelProduct = {
    async ListDepartureLocations() {
        return consultApi('/PackageTourHotelProduct/ListDepartureLocations');
    },
    async PriceSearchList(queryParams) {
        return consultApi('/PackageTourHotelProduct/PriceSearchList', 'post', queryParams);
    },
}

export const OnlyHotelProduct = {
    async PriceSearchList(queryParams) {
        return consultApi('/OnlyHotelProduct/PriceSearchList', 'post', queryParams);
    },
}

export const HotelContent = {
    async ListHotels(hotelIds) {
        return consultApi('/HotelContent/ListHotels', 'post', { hotelIds });
    },
    async ListHotelsInfo(hotelIds, imageSizes = [4, 7]) {
        return consultApi('/HotelContent/ListHotelsInfo', 'post', { hotelIds, imageSizes });
    },
}