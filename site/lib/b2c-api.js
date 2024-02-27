import { consultApi } from "./b2c-api-adapter";

export const PackageTourHotelProduct = {
    async ListDepartureLocations() {
        return consultApi('/PackageTourHotelProduct/ListDepartureLocations');
    }
}

export const HotelContent = {
    async ListHotels(idList) {
        return consultApi('/HotelContent/ListHotels', 'post', { hotelIds: idList });
    },
}