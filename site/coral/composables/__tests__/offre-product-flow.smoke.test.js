import {describe, expect, it, beforeEach, vi} from "vitest";
import {nextTick, ref} from "vue";
import {useOffreProducts} from "../useOffreProducts";
import {useProductOffer} from "../useProductOffer";
import * as b2cApi from "../../../lib/b2c-api";

async function flushAsyncState() {
  for (let idx = 0; idx < 3; idx += 1) {
    await Promise.resolve();
    await nextTick();
  }
}

function createPackageProduct() {
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

describe("offre -> product flow smoke", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("загружает продукты и синхронизирует режим тура между list/map инстансами", async () => {
    const packageProduct = createPackageProduct();
    const hotelOffer = {
      ...packageProduct.offers[0],
      price: {amount: 100000, oldAmount: 130000, currency: "RUB"}
    };

    vi.spyOn(b2cApi.PackageTourHotelProduct, "PriceSearchList").mockResolvedValue({
      result: {
        products: [packageProduct]
      }
    });
    vi.spyOn(b2cApi.OnlyHotelProduct, "PriceSearchList").mockResolvedValue({
      result: {products: [{offers: [hotelOffer]}]}
    });

    const productsState = useOffreProducts({
      props: {
        hotelsList: [{id: "100"}],
        options: {chartersOnly: true, sortBy: "price"}
      },
      matchedHotelsDirectory: ref([{
        id: "100",
        onlyhotel: false,
        timeframes: [{
          key: "june",
          searchFields: {
            beginDates: ["2026-06-10"],
            nights: [7]
          }
        }]
      }]),
      selectedTimeframe: ref("june"),
      hotelInfos: ref([{id: "100", location: {id: "100-7-1-", type: 7}}]),
      selectedDeparture: ref({id: "dep-1", name: "Москва"}),
      regionsLoading: ref(false),
      reloadToken: ref(0)
    });

    await flushAsyncState();
    expect(productsState.productsList.length).toBe(1);
    expect(productsState.normalizedRequestState.value).toBe("success");

    const productRef = ref(productsState.productsList[0]);
    const sharedTourTypeByHotelId = ref({});
    const widgetOptions = {pricing: "default"};
    const widgetHotelsList = ref([{id: "100"}]);

    const listCardState = useProductOffer({
      product: productRef,
      widgetOptions,
      widgetHotelsList,
      sharedTourTypeByHotelId
    });
    const mapCardState = useProductOffer({
      product: productRef,
      widgetOptions,
      widgetHotelsList,
      sharedTourTypeByHotelId
    });

    listCardState.tourType.value = "hotel";
    await flushAsyncState();

    expect(mapCardState.tourType.value).toBe("hotel");
    expect(mapCardState.offer.value.price.amount).toBe(100000);
  });
});
