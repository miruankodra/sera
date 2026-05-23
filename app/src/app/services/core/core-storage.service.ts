import {Injectable} from '@angular/core';
import {Preferences} from '@capacitor/preferences'

@Injectable({
    providedIn: 'root'
})
export class CoreStorageService {
    protected async getItem(key: string): Promise<string> {
        const {value} = await Preferences.get({key});
        return value as string;
    }

    protected async setItem(key: string, value: string): Promise<void> {
        await Preferences.set({key, value});
    }

    protected async removeItem(key: string): Promise<void> {
        await Preferences.remove({key});
    }

    protected async clearStorage(): Promise<void> {
        await Preferences.clear();
    }

    protected async storageKeys(): Promise<string[]> {
        const {keys} = await Preferences.keys();
        return keys;
    }
}
