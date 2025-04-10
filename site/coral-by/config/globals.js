const globals = {
    vueCDNUrl: 'https://unpkg.com/vue@3.4.15/dist/vue.global.js',
    elementPlusCDNUrl: 'https://unpkg.com/element-plus@2.4.4/dist/index.full.min.js',
    elementPlusStylesCDNUrl: 'https://unpkg.com/element-plus@2.4.4/dist/index.css',
    //
    devLocation: 'office',
    productionAPIHost: '//b2capi.coral.ru',
    // devHomeAPIHost: 'http://localhost:8888',
    devHomeAPIHost: 'https://localhost/site/coral/dev-api-cache',
    devOfficeAPIHost: 'http://localhost:8010/proxy',
    //
    timeframeDefaultKey: '*'
};

export default globals;
export const devAPIHost = { home: globals.devHomeAPIHost, office: globals.devOfficeAPIHost }[globals.devLocation];

export const packageCommonSearchCriterias = {
    datePickerMode: 0,
    roomCriterias: [{ "passengers": [{ "age": 20, "passengerType": 0 }, { "age": 20, "passengerType": 0 }] }],
    reservationType: 1,
    imageSizes: [4,7],
};

export const hotelCommonSearchCriterias = {
    reservationType: 2,
    roomCriterias: [{ "passengers": [{ "age": 20, "passengerType": 0 }, { "age": 20, "passengerType": 0 }] }],
    paging: { pageNumber: 1, pageSize: 1, sortType: 0 }
};

Number.prototype.pluralForm = function (root, suffix_list) {
    return root + (this >= 11 && this <= 14 ? suffix_list[0] : suffix_list[this % 10]);
}
Number.prototype.asNights = function () {
    const n = Math.floor(this);
    return n.pluralForm('ноч', ['ей', 'ь', 'и', 'и', 'и', 'ей', 'ей', 'ей', 'ей', 'ей']);
};

Number.prototype.formatPrice = function(prefix, suffix) {
    var s;
    s = String(Math.round(this));
    var sum = s.split('').reverse().join('').replace(/\d{3}(?=\d)/g, "$& ").split('').reverse().join('');
    return `${ prefix ? (prefix + ' ') : '' }${ sum }${ suffix ? (' ' + suffix) : '' }`;
};

Number.prototype.formatCurrency = function (code = 'RUB') {
    return {
        RUB: this.formatPrice('', '₽'),
        EUR: this.formatPrice('€', ''),
        USD: this.formatPrice('$', '')
    }[code];
};