
import { asap, hostReactAppReady } from '../../lib/usefuls';
import { createApp } from "vue";
import ElementPlus from 'element-plus';
import OffreVue from "../components/OffreVue.vue";
import citySpelling from '../components/city-spelling';

asap(async () => {
    await hostReactAppReady();
    const placeholders = document.querySelectorAll('[data-offre-vue]');
    for (const place of placeholders) {
        try {
            const { options, hotels } = JSON.parse(place.textContent);
            const app_root = place.parentElement;
            createVueApp(app_root, options, hotels);
        } catch (ex) {
            console.warn(ex);
        }
    }

});

function createVueApp(app_root, options, hotels) {
    createApp(OffreVue, {
        options,
        hotelsList: hotels
    }).use(ElementPlus).use(citySpelling).mount(app_root);
}