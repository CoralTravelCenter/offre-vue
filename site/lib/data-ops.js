import dayjs from "dayjs";
import duration from 'dayjs/plugin/duration'
import min_max from 'dayjs/plugin/minMax'

dayjs.extend(duration);
dayjs.extend(min_max);

export function hotelSearchTerms(hotel, options) {
    const timeframe = hotel.timeframe ?? options.timeframe;
    const since = timeframe.fixed?.length ? dayjs(timeframe.fixed[0]) : dayjs().add(dayjs.duration(timeframe.fluid[0]));
    const until = timeframe.fixed?.length ? dayjs(timeframe.fixed[1]) : dayjs().add(dayjs.duration(timeframe.fluid[1]));
    debugger;
    if (timeframe.monthly) {
        return [...(function* (since, until) {
            let since_run = since;
            let until_run = dayjs.min(since_run.endOf('month'), until);
            while (since_run.isBefore(until)) {
                yield {
                    beginDates: [since_run.format(), until_run.format()],
                    nights: (hotel.nights ?? options.nights).map(n => ({ value: n }))
                };
                since_run = since_run.add(1, 'month').startOf('month');
                until_run = dayjs.min(since_run.endOf('month'), until);
            }
        })(since, until)];
    } else {
        return {
            beginDates: [since.startOf('day').format(), until.endOf('day').format()],
            nights: (hotel.nights ?? options.nights).map(n => ({ value: n }))
        };
    }
}