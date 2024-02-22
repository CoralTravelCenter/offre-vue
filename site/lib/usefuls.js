export async function preloadScript(url, cb) {
    return new Promise(resolve => {
        const script_el = document.createElement('script');
        script_el.addEventListener('load', () => {
            script_el.remove();
            typeof cb === 'function' && cb();
            resolve();
        });
        script_el.src = url;
        document.head.append(script_el);
    });
}

export function preloadCSS(url) {
    const link = document.createElement('link');
    link.setAttribute('rel', 'stylesheet');
    link.setAttribute('href', url);
    document.head.append(link);
}

export async function hostReactAppReady(cb) {
    return new Promise(resolve => {
        (() => {
            const host_el = document.querySelector('#__next > div');
            if (host_el.getBoundingClientRect().height) {
                resolve();
            } else {
                setTimeout(arguments.callee, 100);
            }
        })();
    });
}

export async function dependency(globalPropName, libUrlOrList, cb) {
    if (window[globalPropName]) {
        cb && cb();
        return Promise.resolve()
    } else {
        const urlsList = Array.isArray(libUrlOrList) ? libUrlOrList : [libUrlOrList];
        const promises = [];
        for (const url of urlsList) {
            if (~url.indexOf('.css')) {
                preloadCSS(url);
            } else {
                promises.push(preloadScript(url))
            }
        }
        return new Promise(async resolve => {
            await Promise.all(promises);
            cb && cb();
            resolve();
        });
    }
}

export async function asap(cb) {
    if (['complete', 'interactive'].includes(document.readyState)) {
        cb && cb();
        return Promise.resolve();
    }
    return new Promise(resolve => {
        document.addEventListener('DOMContentLoaded', () => {
            cb && cb();
            resolve();
        });
    });
}