import {HttpHeaders, HttpParams} from "@capacitor/core";

export interface CoreHttpOptions {
    url: string;
    headers?: HttpHeaders;
    params?: HttpParams;
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    data?: unknown;
}
