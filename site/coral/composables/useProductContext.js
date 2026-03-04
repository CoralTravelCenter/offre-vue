import {inject} from "vue";
import {OFFRE_CONTEXT_KEYS} from "./offreContext";

function injectRequired(key, debugName) {
  const value = inject(key, undefined);
  if (value === undefined) {
    throw new Error(`Product context is missing required provider: ${debugName}`);
  }
  return value;
}

export function useProductContext() {
  return {
    widgetOptions: injectRequired(OFFRE_CONTEXT_KEYS.widgetOptions, 'widgetOptions'),
    widgetHotelsList: injectRequired(OFFRE_CONTEXT_KEYS.widgetHotelsList, 'widgetHotelsList'),
    calcCashback: injectRequired(OFFRE_CONTEXT_KEYS.calcCashback, 'calcCashback'),
    selectedDeparture: injectRequired(OFFRE_CONTEXT_KEYS.selectedDeparture, 'selectedDeparture'),
    productReference: injectRequired(OFFRE_CONTEXT_KEYS.productReference, 'productReference'),
    gridViewMode: injectRequired(OFFRE_CONTEXT_KEYS.gridViewMode, 'gridViewMode'),
    clickedLocationHotelId: injectRequired(OFFRE_CONTEXT_KEYS.clickedLocationHotelId, 'clickedLocationHotelId'),
    sharedTourTypeByHotelId: inject(OFFRE_CONTEXT_KEYS.sharedTourTypeByHotelId, null)
  };
}
