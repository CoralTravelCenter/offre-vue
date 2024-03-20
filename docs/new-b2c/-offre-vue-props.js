
o1 = {
    options: {
        groupBy: 'countries' | 'regions' | 'areas' | 'places',
        chartersOnly: true,
        wildcardOption: 'Все отели',
        pricing: 'per-person' | 'per-night',
        timeframe: {
            fixed: [],
            fluid: ['P14D', 'P21D'],
            monthly: true,
        },
        nights: [6,7,8,9,10,11,12,13]
    },
    hotels: []
}