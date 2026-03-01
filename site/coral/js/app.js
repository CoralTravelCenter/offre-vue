import {asap, hostReactAppReady} from '../../lib/usefuls';
import {createApp} from "vue";
import OffreVue from "../components/Offre";
import citySpelling from '../components/city-spelling';
import stickyDirective from "../directives/sticky";
import '../common/css/index.css'

asap(async () => {
    await hostReactAppReady();
    const placeholders = document.querySelectorAll('[data-offre-vue]');
    for (const place of placeholders) {
        try {
            const {options, hotels} = JSON.parse(place.textContent);
            const app_root = place.parentElement;
            createVueApp(app_root, options, hotels);
        } catch (ex) {
            console.warn(ex);
        }
    }

});

function createVueApp(app_root, options, hotels) {
    const app = createApp(OffreVue, {
        options,
        hotelsList: hotels
    });

    app.directive('sticky', stickyDirective);
    app.use(citySpelling).mount(app_root);
}
