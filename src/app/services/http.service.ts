import {Injectable} from '@angular/core';
import {HttpHeaders, HttpParams} from "@capacitor/core";
import {CoreHttpOptions} from "../models/core/core-http-options";
import {CoreHttpService} from "./core/core-http.service";

@Injectable({
  providedIn: 'root'
})
export class HttpService extends CoreHttpService {

  public async get<T>(url: string, params: HttpParams = {}, headers: HttpHeaders = {}): Promise<T> {
    const options: CoreHttpOptions = {
      method: 'GET',
      url,
      params,
      headers
    }
    return this.httpCall(options).then(async (response) => {
      if (response.status === 200) {
        return response.data;
      }
      throw response.data;
    });
  }

  public async post<T>(url: string, data: T, headers: HttpHeaders = {}): Promise<T> {
    const options: CoreHttpOptions = {
      method: 'POST',
      url,
      data,
      headers
    }
    return this.httpCall(options).then(async (response) => {
      if (response.status === 200) {
        return response.data;
      }
      throw response.data;
    });
  }

  public async put<T>(url: string, data: T, headers: HttpHeaders = {}): Promise<T> {
    const options: CoreHttpOptions = {
      method: 'PUT',
      url,
      data,
      headers
    }
    return this.httpCall(options).then(async (response) => {
      if (response.status === 200) {
        return response.data;
      }
      throw response.data;
    });
  }

  public async delete<T>(url: string, params: HttpParams, headers: HttpHeaders = {}): Promise<T> {
    const options: CoreHttpOptions = {
      method: 'DELETE',
      url,
      params,
      headers
    };
    return this.httpCall(options).then(async (response) => {
      if (response.status === 200) {
        return response.data;
      }
      throw response.data;
    })
  }

}
