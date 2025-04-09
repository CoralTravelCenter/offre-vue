import { ref, watch } from "vue";

export const openedMapMarker = ref();

watch(openedMapMarker, (newMarker, oldMarker) => oldMarker?.exposed.hide());

let _anyProductVisibleTracked = false;
export function trackAnyProductCardVisible() {
    if (!_anyProductVisibleTracked) {
        // console.log('***** trackAnyProductCardVisible *****');
        try {
            ym(96674199, 'reachGoal', 'view_handmade_hotellist');
            _anyProductVisibleTracked = true;
        } catch (ex) {
            console.warn(ex);
        }
    }
}