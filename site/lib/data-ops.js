import dayjs from "dayjs";
import duration from 'dayjs/plugin/duration'
import min_max from 'dayjs/plugin/minMax'
import globals from "../coral/config/globals";

dayjs.extend(duration);
dayjs.extend(min_max);

export function hotelSearchTimeframes(hotel, options) {
    const timeframe = hotel.timeframe ?? options.timeframe;
    if (timeframe.fixed && timeframe.fluid) {
        throw '!!! OffreVue widget config unresolvable. "timeframe" definition contains both "fixed" and "fluid" options.';
    }
    if (timeframe.fixed) {
        if (isStringsTuple(timeframe.fixed)) {
            const [since, until] = timeframe.fixed.map(dt => dayjs(dt));
            if (timeframe.monthly) {
                return monthlyTimeframes(since, until, hotel, options);
            } else {
                return [{
                    key: globals.timeframeDefaultKey,
                    searchFields: {
                        beginDates: [since.startOf('day').format(), until.endOf('day').format()],
                        nights: conformNights(hotel, options)
                    }
                }];
            }
        } else {
            return timeframe.fixed.map(fixed => {
                const [since, until] = fixed.frame.map(dt => dayjs(dt));
                return {
                    key: fixed.key,
                    searchFields: {
                        beginDates: [since.startOf('day').format(), until.endOf('day').format()],
                        nights: conformNights(hotel, options)
                    }
                };
            });
        }
    } else if (timeframe.fluid) {
        const [since, until] = timeframe.fluid.map(duration => dayjs().add(dayjs.duration(duration)));
        if (timeframe.monthly) {
            return monthlyTimeframes(since, until, hotel, options);
        } else {
            return [{
                key: globals.timeframeDefaultKey,
                searchFields: {
                    beginDates: [since.startOf('day').format(), until.endOf('day').format()],
                    nights: conformNights(hotel, options)
                }
            }];
        }
    }

}

function isStringsTuple(obj) {
    return Array.isArray(obj) && obj.length === 2 && obj.every(el => typeof el === 'string');
}

function monthlyTimeframes(since, until, hotel, options) {
    return [...(function* (since, until) {
        let since_run = dayjs.max(dayjs(), since);
        let until_run = dayjs.min(since_run.endOf('month'), until);
        while (since_run.isBefore(until)) {
            yield {
                key: dayjs(since_run).format('MMMM'),
                searchFields: {
                    beginDates: [since_run.startOf('day').format(), until_run.endOf('day').format()],
                    nights: conformNights(hotel, options)
                }
            };
            since_run = since_run.add(1, 'month').startOf('month');
            until_run = dayjs.min(since_run.endOf('month'), until);
        }
    })(since, until)];
}

function conformNights(hotel, options, defaultValue = 7) {
    let nights = hotel.nights ?? options.nights ?? defaultValue;
    if (typeof nights === 'number') nights = [nights];
    return nights.sort((a, b) => a - b);
}

export function isHotelMatchesRegionAndTimeframeKey(hotel, regionKey, regionValue, timeframeKey) {

}