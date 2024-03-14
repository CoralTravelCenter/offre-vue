import { globalDependency, hostReactAppReady } from "./usefuls";

(async (selector_or_checker, deps) => {
    console.log('... await hostReactAppReady');
    await hostReactAppReady();
    console.log('+++ hostReactAppReady');
    let shouldRun = false;
    if (typeof selector_or_checker === 'string') {
        shouldRun = !!document.querySelectorAll(selector_or_checker).length;
    } else if (typeof selector_or_checker === 'function') {
        shouldRun = selector_or_checker();
    }
    if (shouldRun) {
        console.log('+++ shouldRun');
        await Promise.all(Object.entries(deps.globalDependencies).map(([g, list]) => globalDependency(g, list)));
        console.log('+++ loaded globalDependencies');
        globalDependency('load-always', deps.runtimes);
    }
})('[data-offre-vue]', {
        globalDependencies: {
            Vue: ['https://unpkg.com/vue@3.4.15/dist/vue.runtime.global.prod.js'],
            ElementPlus: [
                'https://unpkg.com/element-plus@2.4.4/dist/index.css',
                'https://unpkg.com/element-plus@2.4.4/dist/index.full.min.js'
            ]
        },
    runtimes: [
        'https://b2ccdn.coral.ru/content/lib/offre-vue/runtime.css',
        'https://b2ccdn.coral.ru/content/lib/offre-vue/runtime.js'
    ]
});