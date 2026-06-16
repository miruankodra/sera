import {inject, Injectable} from '@angular/core';
import {HttpService} from './http.service';
import {StorageService} from './storage.service';
import {NavigationService} from './navigation.service';
import {PushNotificationService} from './push-notification.service';
import {HttpPaths} from '../models/constants/http-paths';
import {StoragePaths} from '../models/constants/storage-paths';
import {RoutePaths} from '../models/constants/route-paths';
import {LoginDto} from '../models/login-dto';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private _httpService = inject(HttpService);
  private _storageService = inject(StorageService);
  private _navigationService = inject(NavigationService);
  private _pushService = inject(PushNotificationService);

  async login(email: string, password: string): Promise<void> {
    const response = await this._httpService.post<LoginDto>(HttpPaths.AUTH_LOGIN, {email, password});
    await this._storageService.set(StoragePaths.AUTHORIZATION_TOKEN, response.data.token);
    await this._storageService.set(StoragePaths.USER, response.data.user);
    await this._navigationService.navigateTo(RoutePaths.home);
  }

  async getUser(): Promise<LoginDto['data']['user'] | null> {
    return this._storageService.get<LoginDto['data']['user']>(StoragePaths.USER);
  }

  async logout(): Promise<void> {
    await this._pushService.unregister();
    try {
      await this._httpService.post(HttpPaths.AUTH_LOGOUT, {});
    } finally {
      await this._storageService.clear();
      await this._navigationService.navigateTo(RoutePaths.login);
    }
  }

  async isAuthenticated(): Promise<boolean> {
    return this._storageService.has(StoragePaths.AUTHORIZATION_TOKEN);
  }
}
