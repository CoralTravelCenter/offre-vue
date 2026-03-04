import {describe, expect, it, beforeEach, vi} from "vitest";
import {nextTick, ref} from "vue";
import {useOffreProducts} from "../useOffreProducts";
import * as b2cApi from "../../../lib/b2c-api";

async function flushAsyncState() {
  for (let idx = 0; idx < 3; idx += 1) {
    await Promise.resolve();
    await nextTick();
  }
}

function createParams() {
  return {
    props: {
      hotelsList: [1],
      options: {chartersOnly: true, sortBy: "price"}
    },
    matchedHotelsDirectory: ref([{
      id: 1,
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
    hotelInfos: ref([{id: 1, location: {id: "1-7-1-", type: 7}}]),
    selectedDeparture: ref({id: "dep-1", name: "Москва"}),
    regionsLoading: ref(false),
    reloadToken: ref(0)
  };
}

describe("useOffreProducts", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("возвращает success и список продуктов при успешном ответе", async () => {
    vi.spyOn(b2cApi.PackageTourHotelProduct, "PriceSearchList").mockResolvedValue({
      result: {
        products: [{
          hotel: {id: 1},
          offers: [{price: {amount: 120000}}]
        }],
        hotelCategories: {}
      }
    });

    const offerProducts = useOffreProducts(createParams());
    await flushAsyncState();

    expect(offerProducts.normalizedRequestState.value).toBe("success");
    expect(offerProducts.productsList.length).toBe(1);
  });

  it("возвращает error если все запросы завершились с ошибкой", async () => {
    vi.spyOn(b2cApi.PackageTourHotelProduct, "PriceSearchList").mockRejectedValue(new Error("api failed"));

    const offerProducts = useOffreProducts(createParams());
    await flushAsyncState();

    expect(offerProducts.normalizedRequestState.value).toBe("error");
    expect(offerProducts.productsError.value).toBe(true);
  });
});
