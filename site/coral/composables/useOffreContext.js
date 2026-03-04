import {provide} from "vue";
import {OFFRE_CONTEXT_KEYS} from "./offreContext";

export function provideOffreContext(context) {
  provide(OFFRE_CONTEXT_KEYS.widgetOptions, context.widgetOptions);
  provide(OFFRE_CONTEXT_KEYS.widgetHotelsList, context.widgetHotelsList);
  provide(OFFRE_CONTEXT_KEYS.calcCashback, context.calcCashback);
  provide(OFFRE_CONTEXT_KEYS.layoutMode, context.layoutMode);
  provide(OFFRE_CONTEXT_KEYS.selectedDeparture, context.selectedDeparture);
  provide(OFFRE_CONTEXT_KEYS.sharedTourTypeByHotelId, context.sharedTourTypeByHotelId);
  provide(OFFRE_CONTEXT_KEYS.productReference, context.productReference);
  provide(OFFRE_CONTEXT_KEYS.clickedLocationHotelId, context.clickedLocationHotelId);
  provide(OFFRE_CONTEXT_KEYS.gridViewMode, context.gridViewMode);
}
