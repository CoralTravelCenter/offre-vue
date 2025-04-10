const citiesDictionary = [
    { b2cName: "Минск", genitiveCase: 'Минска' },
    { b2cName: "Брест", genitiveCase: 'Бреста' },
    { b2cName: "Витебск", genitiveCase: 'Витебска' },
    { b2cName: "Гомель", genitiveCase: 'Гомеля' },
    { b2cName: "Могилев", genitiveCase: 'Могилева' },
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