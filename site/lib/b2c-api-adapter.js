import hash from 'object-hash';
import globals, { devAPIHost } from "../coral/config/globals";
export async function consultApi(endpoint, method = 'post', params = {}) {
    const request_hash = hash({ endpoint, method, params });
    console.log('+++ consultApi: params: %o; hash: %o', params, request_hash);
    const cached_response = sessionStorage.getItem(request_hash);
    if (cached_response) {
        return Promise.resolve(JSON.parse(cached_response));
    }
    let apiHost;
    const queryParams = new URLSearchParams(params);
    if (location.hostname === 'localhost') {
        if (globals.devLocation === 'home') {

        } else if (globals.devLocation === 'office') {
            apiHost = globals.devOfficeAPIHost;
        }
    } else {
        apiHost = globals.productionAPIHost;
    }
    if (method.toUpperCase() === 'GET') {
        return new Promise(async resolve => {
            const api_data = await fetch(`${ apiHost }${ endpoint }?${ new URLSearchParams(params).toString() }`).then(response => response.json());
            sessionStorage.setItem(request_hash, JSON.stringify(api_data));
            resolve(api_data);
        });
    } else if (method.toUpperCase() === 'POST') {
        return new Promise(async resolve => {
            const api_data = await fetch(`${ apiHost }${ endpoint }`, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(params)
            }).then(response => response.json());
            sessionStorage.setItem(request_hash, JSON.stringify(api_data));
            resolve(api_data);
        });
    }
}