const searchCriterias = {
    "beginDates": [
        "2024-06-01T00:00:00Z",
        "2024-06-30T00:00:00Z"
    ],
    "arrivalLocations": [
        {
            "id": "1-0--",
            "locationId": "1",
            "locationUniqueId": "Country_1",
            "countryIds": null,
            "type": 0,
            "name": "Турция",
            "countryName": "Турция",
            "friendlyUrl": "turtsiya",
            "parent": null,
            "children": null
        }
    ],
    "departureLocations": [
        {
            "id": "2671-5--",
            "locationId": "2671",
            "locationUniqueId": "Area_2671",
            "countryIds": null,
            "type": 5,
            "name": "Москва",
            "countryName": null,
            "friendlyUrl": "moskva",
            "parent": null,
            "children": null
        }
    ],
    "nights": [
        {
            "value": 7
        }
    ],
    "datePickerMode": 0,
    "roomCriterias": [
        {
            "passengers": [
                {
                    "age": 20,
                    "passengerType": 0
                },
                {
                    "age": 20,
                    "passengerType": 0
                }
            ]
        }
    ],
    "reservationType": 1,
    "paging": {
        "pageNumber": 1,
        "pageSize": 20,
        "sortType": 0
    },
    "additionalFilters": [
        {
            "type": 18,
            "values": [
                {
                    "id": "3815-7-1-",
                    // "value": "EFTALIA AQUA RESORT"
                },
                {
                    "id": "55032-7-1-",
                    // "value": "EFTALIA BLUE"
                }
            ],
            "providers": []
        }
    ],
    "imageSizes": [
        0
    ],
    "flightType": 2
};
const query = { searchCriterias };
fetch('https://b2cpilotapi.coral.ru/PackageTourHotelProduct/PriceSearchList', {
    method: 'post',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(query)
}).then(response => response.json()).then(json => console.log(json));
