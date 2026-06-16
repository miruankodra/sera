import {Injectable} from '@angular/core';
import {HttpHeaders, HttpParams} from "@capacitor/core";
import {CoreHttpOptions} from "../models/core/core-http-options";
import {CoreHttpService} from "./core/core-http.service";

@Injectable({
  providedIn: 'root'
})
export class HttpService extends CoreHttpService {

  public async get<TResponse>(url: string, params: HttpParams = {}, headers: HttpHeaders = {}): Promise<TResponse> {
    const options: CoreHttpOptions = {method: 'GET', url, params, headers};
    return this.httpCall(options).then((response) => {
      if (response.status >= 200 && response.status < 300) {
        return response.data;
      }
      throw response.data;
    });
  }

  public async post<TResponse = void, TBody = unknown>(url: string, data: TBody, headers: HttpHeaders = {}): Promise<TResponse> {
    const options: CoreHttpOptions = {method: 'POST', url, data, headers};
    return this.httpCall(options).then((response) => {
      if (response.status >= 200 && response.status < 300) {
        return response.data;
      }
      throw response.data;
    });
  }

  public async put<TResponse = void, TBody = unknown>(url: string, data: TBody, headers: HttpHeaders = {}): Promise<TResponse> {
    const options: CoreHttpOptions = {method: 'PUT', url, data, headers};
    return this.httpCall(options).then((response) => {
      if (response.status >= 200 && response.status < 300) {
        return response.data;
      }
      throw response.data;
    });
  }

  public async delete<TResponse = void>(url: string, params: HttpParams = {}, headers: HttpHeaders = {}): Promise<TResponse> {
    const options: CoreHttpOptions = {method: 'DELETE', url, params, headers};
    return this.httpCall(options).then((response) => {
      if (response.status >= 200 && response.status < 300) {
        return response.data;
      }
      throw response.data;
    });
  }

}
