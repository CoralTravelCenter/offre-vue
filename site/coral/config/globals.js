const globals = {
    vueCDNUrl: 'https://unpkg.com/vue@3.4.15/dist/vue.global.js',
    elementPlusCDNUrl: 'https://unpkg.com/element-plus@2.4.4/dist/index.full.min.js',
    elementPlusStylesCDNUrl: 'https://unpkg.com/element-plus@2.4.4/dist/index.css',
    //
    devLocation: 'office',
    productionAPIHost: '//b2cpilotapi.coral.ru',
    devHomeAPIHost: 'http://localhost:8888',
    devOfficeAPIHost: 'http://localhost:8010/proxy'
};

export default globals;
export const devAPIHost = { home: globals.devHomeAPIHost, office: globals.devOfficeAPIHost }[globals.devLocation];
