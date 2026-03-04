export const REQUEST_STATE = Object.freeze({
  IDLE: 'idle',
  LOADING: 'loading',
  SUCCESS: 'success',
  ERROR: 'error'
});

export function normalizeProductsRequestState(productsState, productsStateEnum) {
  if (productsState === productsStateEnum.LOADING) {
    return REQUEST_STATE.LOADING;
  }
  if (productsState === productsStateEnum.ERROR) {
    return REQUEST_STATE.ERROR;
  }
  if (productsState === productsStateEnum.SUCCESS || productsState === productsStateEnum.EMPTY) {
    return REQUEST_STATE.SUCCESS;
  }
  return REQUEST_STATE.IDLE;
}
