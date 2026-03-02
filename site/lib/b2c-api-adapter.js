import hash from 'object-hash';
import globals from "../coral/config/globals";
// import globals, { devAPIHost } from "../coral-by/config/globals";

async function fetchJson(url, options) {
    const response = await fetch(url, options);
    if (!response.ok) {
        const error = new Error(`B2C API request failed: ${ response.status } ${ response.statusText }`);
        error.status = response.status;
        error.statusText = response.statusText;
        error.url = url;
        throw error;
    }
    try {
        return await response.json();
    } catch (error) {
        const parseError = new Error(`B2C API response parse failed for ${ url }`);
        parseError.cause = error;
        parseError.url = url;
        throw parseError;
    }
}

export async function consultApi(endpoint, method = 'post', params = {}) {
    const request_hash = hash({ endpoint, method, params });
    console.log('+++ consultApi: params: %o; hash: %o', params, request_hash);
    const cached_response = sessionStorage.getItem(request_hash);
    if (cached_response) {
        try {
            return Promise.resolve(JSON.parse(cached_response));
        } catch (error) {
            sessionStorage.removeItem(request_hash);
        }
    }
    let apiHost;
    if (location.hostname === 'localhost') {
        if (globals.devLocation === 'home') {
            apiHost = globals.devHomeAPIHost;
            endpoint = `/${ request_hash }.json`;
            method = 'get';
            params = {};
        } else if (globals.devLocation === 'office') {
            apiHost = globals.devOfficeAPIHost;
        }
    } else {
        apiHost = globals.productionAPIHost;
    }
    if (method.toUpperCase() === 'GET') {
        const api_data = await fetchJson(`${ apiHost }${ endpoint }?${ new URLSearchParams(params).toString() }`);
        sessionStorage.setItem(request_hash, JSON.stringify(api_data));
        return api_data;
    } else if (method.toUpperCase() === 'POST') {
        const api_data = await fetchJson(`${ apiHost }${ endpoint }`, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(params)
        });
        sessionStorage.setItem(request_hash, JSON.stringify(api_data));
        return api_data;
    }
    throw new Error(`Unsupported method for consultApi: ${ method }`);
}
