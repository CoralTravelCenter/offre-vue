(function () {

    /** For adding a new promotion update PROMOS_DATA and a function-condition in CONDITIONS*/

    /**
     * @type {Object} PROMOS_DATA
     * */

    const PROMOS_DATA = {
        /**
         * @type {string} name | required - technical name, user doesn't see it
         * @type {string} hardcoded_content_num | optional - to show a fixed bonus in percentages (no need if bonus in RUB)
         * @type {string} content_txt | required - to show a user annotation of promotion
         * */

        promotion1: {
            name: "coral_bonus_for_all",
            hardcoded_content_num: '1%',
            content_txt: 'от стоимости тура на следующее путешествие',
        },
        promotion2: {
            name: "favourite_hotels",
            content_txt: 'по акции «Любимый отель»',
            content_link: '/poleznaya-informatsiya/offers/hot-offers/lyubimiy-hotel/?erid=LjN8K9iZn',
        },
        promotion3: {
            name: "v_otpusk_i_to4ka",
            content_txt: 'по акции «В отпуск и точка!»',
            content_link: '/poleznaya-informatsiya/offers/hot-offers/v-otpusk-i-tochka/?erid=LjN8JwdJg',
        },
        promotion4: {
            name: "cb_new_user",
            content_txt: 'для новых владельцев карт СoralBonus по акции «Добро пожаловать!»',
            content_link: '/poleznaya-informatsiya/offers/hot-offers/aktsiya-dobro-pozhalovaty/?erid=LjN8KAQkG',
            /* (при активации бонусной карты с 01.02.24 по 31.05.24 г.) */

        },

    };

    /* So as we can't identify if the user has a CB card  currently, will show to everyone */
    const new_cb_user = true;

    /* Constants that a used in counting (in functions CONDITIONS)  */
    const CONSTANTS = {
        /* Constants for new users "cb_new_user" */
        cb_welcome_BONUSES: 3000,
        cb_welcome_BONUSES_UNIT: "RUB",
        cb_welcome_ALLOWED_INTERVAL: 14,
        cb_welcome_NIGHTS: 7,
        cb_welcome_DIRECTIONS: [1, 31, 12, 40, 35, 39, 63, 33, 48], /* Country IDS */

        /* Constants for "coral_bonus_for_all" */
        cb_privilig_BONUSES: 1,
        cb_privilig_BONUSES_UNIT: "%",
        cb_privilig_ALLOWED_INTERVAL: 14,

        /* Константы для "favourite_hotels" */
        favourite_hotels_BONUSES: 1000,
        /* @param TYPE: ARRAY of NUMBERs */
        favourite_hotels: [52523, 16396, 358, 25495, 799, 4233, 50385, 800, 6936, 30897, 12520, 8213, 6975, 5205, 5217, 5174, 9408, 15254, 6659, 52524, 16482, 16483, 52525, 10197, 30303, 9910, 682, 11051, 949, 656, 311, 30477, 768, 12914, 981, 20518, 15367, 3815, 55032, 11013, 21601, 8028, 874, 12879, 13448, 12880, 29449, 30511, 737, 52247, 52520, 52521, 52522, 52528, 27570, 565, 34337, 10105, 10225, 56305, 33418, 58251, 56394, 17847, 722, 10825, 4407, 30730, 58222, 52527, 345],
        favourite_hotels_NIGHTS: 7,
        /* Константы для   "v_otpusk_i_to4ka" */
        /*
        *  KEY - id of country
        *   VALUE - Object with KEY 'stars number  of the hotel'
        *   and VALUE 'bonus in RUB'
        *
        * */
        v_otpysk_map_country_star: {

            /* turkey */
            ['1']: {
                ["3"]: 3000,
                ["4"]: 4000,
                ["5"]: 5000,
            },
            /* united-arab-emirates */
            ["31"]: {
                ["3"]: 3000,
                ["4"]: 4000,
                ["5"]: 5000,
            },
            /* egypt */
            ["12"]: {
                ["3"]: 3000,
                ["4"]: 4000,
                ["5"]: 5000,
            },

            /* bahrain: */
            ["282"]: {
                ["3"]: 3000,
                ["4"]: 4000,
                ["5"]: 5000,
            },

            /* sri-lanka */
            ["40"]: {
                ["3"]: 3000,
                ["4"]: 4000,
                ["5"]: 5000,
            },

            /* maldives: */
            ["35"]: {
                ["3"]: 5000,
                ["4"]: 6000,
                ["5"]: 7000,
            },

            /* seychelles: */
            ["39"]: {
                ["3"]: 5000,
                ["4"]: 6000,
                ["5"]: 7000,
            },

            /*  mauritius: */
            ["63"]: {
                ["3"]: 5000,
                ["4"]: 6000,
                ["5"]: 7000,
            },

            /* cuba: */
            ["48"]: {
                ["3"]: 5000,
                ["4"]: 6000,
                ["5"]: 7000,
            },

            /*  thailand: */
            ["33"]: {
                ["3"]: 5000,
                ["4"]: 6000,
                ["5"]: 7000,
            },
        },

        v_otpysk_ALLOWED_INTERVAL: 14,
        v_otpysk_NIGHTS: 7,


    };

    /**
     * @type {object} CONDITIONS
     * */

    const CONDITIONS = {
        /**
         * For PROMO 1
         * @param {Object} prod
         * @returns {number} bonus (in RUB)
         * */

        [PROMOS_DATA.promotion1.name]: (prod) => {
            const bonus = parseInt(
                    parseFloat(prod.price) * (CONSTANTS.cb_privilig_BONUSES / 100)
                );


            return bonus;
        },

        /**
         * For PROMO 2
         * @param {Object} prod
         * @returns {number} bonus (in RUB)
         * */

        [PROMOS_DATA.promotion2.name]: (prod) => {
            let bonus = 0;

            if (CONSTANTS.favourite_hotels.includes(prod.id) &&
                (prod.night >= CONSTANTS.favourite_hotels_NIGHTS)) {
                bonus = CONSTANTS.favourite_hotels_BONUSES;
            }

            return bonus;
        },

        /**
         * For PROMO 3
         * @param {Object} prod
         * @returns {number} bonus (in RUB)
         * */
        [PROMOS_DATA.promotion3.name]: (prod) => {
            let bonus = 0;

            /* Additional Bonuses for Stars of the Hotel */
            let starNum = parseFloat(prod.star).toString();
            let starBonus;
            if (CONSTANTS.v_otpysk_map_country_star[prod.countryID.toString()]) {
                starBonus = CONSTANTS.v_otpysk_map_country_star[prod.countryID.toString()][starNum];
            }

            if ((!isNaN(Number(starBonus)) && isFinite(starBonus)) &&
                (new Date(prod.checkInDate).getTime() - Date.now() >=
                    CONSTANTS.v_otpysk_ALLOWED_INTERVAL * 1000 * 60 * 60 * 24) &&
                (prod.night >= CONSTANTS.v_otpysk_NIGHTS))

                {
                bonus += parseFloat(starBonus);
            }

            return bonus;
        },


        /**
         * For PROMO 4
         * @param {Object} prod
         * @returns {number} bonus (in RUB)
         * */

        [PROMOS_DATA.promotion4.name]: (prod) => {
            let bonus = 0;

            if (new_cb_user) {
                if (
                    (prod.night >= CONSTANTS.cb_welcome_NIGHTS) &&
                    (new Date(prod.checkInDate).getTime() - Date.now() >=
                CONSTANTS.cb_welcome_ALLOWED_INTERVAL * 1000 * 60 * 60 * 24) &&
                    (CONSTANTS.cb_welcome_DIRECTIONS.includes(prod.countryID))
                )

                bonus = CONSTANTS.cb_welcome_BONUSES;

            }

            return bonus;
        },
    };

    /**
     * Main Global Function

     * @param {Object} product
     *
     * @param {Number || String} product.id
     * @param {Number || String} product.night - amount of nights
     * @param {Number || String} product.day - amount of days
     * @param {Number || String} product.star - amount of stars
     * @param {Number || String} product.price
     * @param {String} product.checkInDate - in format ISO 8601 Extended (YYYY-MM-DDTHH:mm:ss.sssZ)
     * @param {String} product.name - Hotel Name
     * @param {Number || String} product.countryID
     * @param {Boolean} isOnlyHotel
     *
     * @returns  {Object}
     */
    window._get_CBonuses = (product) => {

        const results = [];
        const listOfPromos = [];

        product = convertTypes(product);

        for (let obj of Object.values(PROMOS_DATA)) {
            if (CONDITIONS[obj.name]) {
                const result = CONDITIONS[obj.name](product);

                if (result !== 0) {

                    const dataObj = {
                        content_num: obj.hardcoded_content_num || result.toLocaleString("ru-RU", {
                            style: "currency",
                            currency: "RUB",
                            minimumFractionDigits: "0"
                        }),
                        content_txt: obj.content_txt,
                        content_link: obj.content_link,
                    };
                    listOfPromos.push(dataObj);
                    results.push(result);

                }
            }
        }


        let finalBonuses = 0;
        for (let res of results) {
            finalBonuses += res;
        }

        return {
            listOfPromos: listOfPromos,
            finalBonus: finalBonuses,
        };
    }

    function convertTypes(product) {
        return {
            id: parseInt(product.id),
            night: parseInt(product.night),
            day: parseInt(product.day),
            star: parseInt(product.star),
            price: parseFloat(product.price),
            checkInDate: product.checkInDate,
            name: product.name,
            countryID: parseInt(product.countryID),
            isOnlyHotel: Boolean(product.isOnlyHotel),
        }
    }

})();










