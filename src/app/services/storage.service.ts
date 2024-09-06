import {Injectable} from '@angular/core';
import {CoreStorageService} from "./core/core-storage.service";

@Injectable({
  providedIn: 'root'
})
export class StorageService extends CoreStorageService {

  public async get<T>(key: string): Promise<T> {
    const value: string = await this.getItem(key);
    return JSON.parse(value);
  }

  public async set<T>(key: string, value: T): Promise<void> {
    await this.setItem(key, JSON.stringify(value));
  }

  public async remove(key: string): Promise<void> {
    return this.removeItem(key);
  }

  public async clear(): Promise<void> {
    return this.clearStorage();
  }

  public async has(key: string): Promise<boolean> {
    const keys = await this.storageKeys();
    return keys.includes(key) ?? false;
  }

}
