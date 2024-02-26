import { consultApi } from "./b2c-api-adapter";

export const PackageTourHotelProduct = {
    async ListDepartureLocations() {
        return consultApi('/PackageTourHotelProduct/ListDepartureLocations');
    }
}