const searchCriterias = {
        "reservationType":  2,
        "beginDates":       [
            "2024-06-11"
        ],
        "nights":           [
            {
                "value": 7
            }
        ],
        "roomCriterias":    [
            {
                "passengers": [
                    {
                        "age":           20,
                        "passengerType": 0
                    },
                    {
                        "age":           20,
                        "passengerType": 0
                    }
                ]
            }
        ],
        "arrivalLocations": [
            {
                "id":   "49757-7-12-",
                "type": 7,
            }
        ],
        "paging":           {
            "pageNumber": 1,
            "pageSize":   1,
            "sortType":   0
        },
    }
;
const query = { searchCriterias };
fetch('https://b2capi.coral.ru/OnlyHotelProduct/PriceSearchList', {
    method: 'post',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(query)
}).then(response => response.json()).then(json => console.log(json));
