const citiesDictionary = [
    { b2cName: "Москва", genitiveCase: 'Москвы' },
    { b2cName: "Абакан", genitiveCase: 'Абакана' },
    { b2cName: "Архангельск", genitiveCase: 'Архангельска' },
    { b2cName: "Астрахань", genitiveCase: 'Астрахани' },
    { b2cName: "Барнаул", genitiveCase: 'Барнаула' },
    { b2cName: "Владивосток", genitiveCase: 'Владивостока' },
    { b2cName: "Волгоград", genitiveCase: 'Волгограда' },
    { b2cName: "Грозный", genitiveCase: 'Грозного' },
    { b2cName: "Екатеринбург", genitiveCase: 'Екатеринбурга' },
    { b2cName: "Ижевск", genitiveCase: 'Ижевска' },
    { b2cName: "Иркутск", genitiveCase: 'Иркутска' },
    { b2cName: "Казань", genitiveCase: 'Казани' },
    { b2cName: "Калининград", genitiveCase: 'Калининграда' },
    { b2cName: "Кемерово", genitiveCase: 'Кемерово' },
    { b2cName: "Красноярск", genitiveCase: 'Красноярска' },
    { b2cName: "Махачкала", genitiveCase: 'Махачкалы' },
    { b2cName: "Минеральные воды", correctName: 'Минеральные Воды', genitiveCase: 'Минеральных Вод' },
    { b2cName: "Мурманск", genitiveCase: 'Мурманска' },
    { b2cName: "Н. Новгород", correctName: 'Нижний Новгород', genitiveCase: 'Нижнего Новгорода' },
    { b2cName: "Нижневартовск", genitiveCase: 'Нижневартовска' },
    { b2cName: "Нижнекамск", genitiveCase: 'Нижнекамска' },
    { b2cName: "Новокузнецк", genitiveCase: 'Новокузнецка' },
    { b2cName: "Новосибирск", genitiveCase: 'Новосибирска' },
    { b2cName: "Омск", genitiveCase: 'Омска' },
    { b2cName: "Оренбург", genitiveCase: 'Оренбурга' },
    { b2cName: "Пермь", genitiveCase: 'Перми' },
    { b2cName: "Самара", genitiveCase: 'Самары' },
    { b2cName: "Санкт-Петербург", genitiveCase: 'Санкт-Петербурга' },
    { b2cName: "Саратов", genitiveCase: 'Саратова' },
    { b2cName: "Сочи", genitiveCase: 'Сочи' },
    { b2cName: "Сургут", genitiveCase: 'Сургута' },
    { b2cName: "Сыктывкар", genitiveCase: 'Сыктывкара' },
    { b2cName: "Тюмень", genitiveCase: 'Тюмени' },
    { b2cName: "Уфа", genitiveCase: 'Уфы' },
    { b2cName: "Хабаровск", genitiveCase: 'Хабаровска' },
    { b2cName: "Ханты-Мансийск", genitiveCase: 'Ханты-Мансийска' },
    { b2cName: "Челябинск", genitiveCase: 'Челябинска' },
    { b2cName: "Якутск", genitiveCase: 'Якутска' },
    { b2cName: "Ярославль", genitiveCase: 'Ярославля' },
];
export default {
    install(app, options) {
        app.config.globalProperties.$cityCorrectName = (name) => {
            return citiesDictionary.find(c => c.b2cName === name)?.correctName || name;
        };
        app.config.globalProperties.$cityGenitiveCase = (name) => {
            return citiesDictionary.find(c => c.b2cName === name)?.genitiveCase || name;
        };
    }
}