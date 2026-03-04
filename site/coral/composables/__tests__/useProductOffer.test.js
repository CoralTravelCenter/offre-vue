import {describe, expect, it, beforeEach, vi} from "vitest";
import {nextTick, ref} from "vue";
import {useProductOffer} from "../useProductOffer";
import * as b2cApi from "../../../lib/b2c-api";

function flushPromises() {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

function createProduct() {
  return {
    hotel: {
      id: "100",
      countryKey: "1",
      categoryKey: "1",
      location: {id: "100-7-1-", type: 7}
    },
    offers: [{
      checkInDate: "2026-06-10",
      stayNights: 7,
      price: {amount: 140000, oldAmount: 170000, currency: "RUB"},
      rooms: [{passengers: [{}, {}]}],
      link: {redirectionUrl: "/turkey/test-hotel", queryParam: "qp"}
    }]
  };
}

describe("useProductOffer", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("синхронизирует tourType между инстансами одного отеля", async () => {
    vi
      .spyOn(b2cApi.OnlyHotelProduct, "PriceSearchList")
      .mockResolvedValue({result: {products: [{offers: [createProduct().offers[0]]}]}})

    const sharedTourTypeByHotelId = ref({});
    const widgetOptions = {pricing: "default"};
    const widgetHotelsList = ref([{id: "100"}]);
    const product = ref(createProduct());

    const first = useProductOffer({
      product,
      widgetOptions,
      widgetHotelsList,
      sharedTourTypeByHotelId
    });
    const second = useProductOffer({
      product,
      widgetOptions,
      widgetHotelsList,
      sharedTourTypeByHotelId
    });

    expect(first.tourType.value).toBe("package");
    expect(second.tourType.value).toBe("package");

    first.tourType.value = "hotel";
    await nextTick();

    expect(second.tourType.value).toBe("hotel");
  });

  it("в режиме hotel запрашивает отдельный оффер и обновляет цену", async () => {
    const hotelOffer = {
      checkInDate: "2026-06-10",
      stayNights: 7,
      price: {amount: 100000, oldAmount: 130000, currency: "RUB"},
      rooms: [{passengers: [{}, {}]}],
      link: {redirectionUrl: "/turkey/test-hotel", queryParam: "qp"}
    };

    const searchSpy = vi
      .spyOn(b2cApi.OnlyHotelProduct, "PriceSearchList")
      .mockResolvedValue({result: {products: [{offers: [hotelOffer]}]}});

    const offerState = useProductOffer({
      product: ref(createProduct()),
      widgetOptions: {pricing: "default"},
      widgetHotelsList: ref([{id: "100"}]),
      sharedTourTypeByHotelId: ref({})
    });

    offerState.tourType.value = "hotel";
    await flushPromises();

    expect(searchSpy).toHaveBeenCalledTimes(1);
    expect(offerState.offer.value.price.amount).toBe(100000);
    expect(offerState.offerRequestState.value).toBe("success");
  });

  it("в режиме hotel при ошибке оставляет package-оффер и выставляет error", async () => {
    vi
      .spyOn(b2cApi.OnlyHotelProduct, "PriceSearchList")
      .mockRejectedValue(new Error("network error"));

    const offerState = useProductOffer({
      product: ref(createProduct()),
      widgetOptions: {pricing: "default"},
      widgetHotelsList: ref([{id: "100"}]),
      sharedTourTypeByHotelId: ref({})
    });

    const packageAmount = offerState.offer.value.price.amount;
    offerState.tourType.value = "hotel";
    await flushPromises();

    expect(offerState.offer.value.price.amount).toBe(packageAmount);
    expect(offerState.offerRequestState.value).toBe("error");
    expect(offerState.hotelOfferError.value).toBeTruthy();
  });
});
