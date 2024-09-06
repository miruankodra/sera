import {inject, Injectable} from '@angular/core';
import {CoreHttpOptions} from "../../models/core/core-http-options";
import {CapacitorHttp, HttpHeaders, HttpResponse} from "@capacitor/core";
import {environment} from "../../../environment/environment";
import {StorageService} from "../storage.service";
import {StoragePaths} from "../../models/constants/storage-paths";

@Injectable({
  providedIn: 'root'
})
export class CoreHttpService {

  private _storageService: StorageService = inject(StorageService);
  private _baseUrl = environment.API_URL;
  private _headers: HttpHeaders = {
    'Content-Type': 'application/json',
    'User-Agent': environment.APP_AGENT,
    App: environment.APP_NAME
  };

  protected async prepareHeaders(): Promise<void> {
    await Promise.all([
      this._storageService.get(StoragePaths.AUTHORIZATION_TOKEN).then((token) => {
        if (token) {
          this._headers['Authorization'] = `Bearer ${token}`;
        }
      }),
      //   TODO: Mos harro llogjiken e plote te storage persa i perket authentifikimit
    ])
  }

  protected async httpCall(options: CoreHttpOptions): Promise<HttpResponse> {
    await this.prepareHeaders();
    const _httpHeaders: HttpHeaders = {...options.headers, ...this._headers};
    return await CapacitorHttp.request({
      url: `${this._baseUrl}/${options.url}`,
      method: options.method,
      headers: _httpHeaders,
      data: options.data,
      params: options.params
    });
  }
}
