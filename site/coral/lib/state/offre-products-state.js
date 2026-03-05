export const OFFRE_PRODUCTS_REQUEST_STATE = Object.freeze({
  IDLE: 'idle',
  LOADING: 'loading',
  SUCCESS: 'success',
  EMPTY: 'empty',
  ERROR: 'error'
});

export function reduceOffreProductsRequestState(currentState, event) {
  switch (event?.type) {
    case 'RESET':
      return OFFRE_PRODUCTS_REQUEST_STATE.IDLE;
    case 'NO_QUERIES':
      return OFFRE_PRODUCTS_REQUEST_STATE.EMPTY;
    case 'START_LOADING':
      return OFFRE_PRODUCTS_REQUEST_STATE.LOADING;
    case 'RESOLVE_BATCH':
      if (event.failedQueries === event.queryCount) {
        return OFFRE_PRODUCTS_REQUEST_STATE.ERROR;
      }
      return event.productsCount > 0
        ? OFFRE_PRODUCTS_REQUEST_STATE.SUCCESS
        : OFFRE_PRODUCTS_REQUEST_STATE.EMPTY;
    default:
      return currentState;
  }
}
