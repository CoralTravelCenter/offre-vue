const globals = {
    vueCDNUrl: 'https://unpkg.com/vue@3.4.15/dist/vue.global.js',
    elementPlusCDNUrl: 'https://unpkg.com/element-plus@2.4.4/dist/index.full.min.js',
    elementPlusStylesCDNUrl: 'https://unpkg.com/element-plus@2.4.4/dist/index.css',
    //
    devLocation: 'home',
    productionAPIHost: '//b2cpilotapi.coral.ru',
    // devHomeAPIHost: 'http://localhost:8888',
    devHomeAPIHost: 'https://localhost/site/coral/dev-api-cache',
    devOfficeAPIHost: 'http://localhost:8010/proxy'
};

export default globals;
export const devAPIHost = { home: globals.devHomeAPIHost, office: globals.devOfficeAPIHost }[globals.devLocation];

export const commonSearchCriterias = {
    datePickerMode: 0,
    roomCriterias: [{ "passengers": [{ "age": 20, "passengerType": 0 }, { "age": 20, "passengerType": 0 }] }],
    reservationType: 1,
    imageSizes: [4,7],
};