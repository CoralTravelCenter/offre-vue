import hash from 'object-hash';
import { devAPIHost } from "../coral/config/globals";
export async function consultApi(endpoint, method = 'post', params = {}) {
    const request_hash = hash({ endpoint, method, params });
    console.log('+++ params: %o; hash: %o', params, request_hash);
    const cached_response = sessionStorage.getItem(request_hash);
    if (cached_response) {
        return Promise.resolve(JSON.parse(cached_response));
    }

}