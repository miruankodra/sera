import {Injectable, inject, signal} from '@angular/core';
import {StorageService} from './storage.service';
import {StoragePaths} from '../models/constants/storage-paths';
import {en} from '../i18n/en';
import {sq} from '../i18n/sq';

export type AppLocale = 'en' | 'sq';

type Dictionary = typeof en;

const DICTIONARIES: Record<AppLocale, Dictionary> = {en, sq};

@Injectable({
  providedIn: 'root'
})
export class TranslationService {
  private _storage = inject(StorageService);

  readonly locale = signal<AppLocale>('sq');
  private _initialized = false;
  private _accountSyncedOnce = false;
  private _userChangedThisSession = false;

  async init(): Promise<void> {
    if (this._initialized) return;
    this._initialized = true;

    const stored = await this._storage.get<AppLocale>(StoragePaths.LOCALE);
    if (stored === 'en' || stored === 'sq') {
      this.locale.set(stored);
      return;
    }

    const browserLang = (navigator.language || 'sq').slice(0, 2);
    this.locale.set(browserLang === 'en' ? 'en' : 'sq');
  }

  async setLocale(locale: AppLocale): Promise<void> {
    this._userChangedThisSession = true;
    this.locale.set(locale);
    await this._storage.set(StoragePaths.LOCALE, locale);
    await this._storage.set(StoragePaths.LOCALE_USER_SET, true);
  }

  /**
   * Adopt a locale value already stored on the user's account, for cross-device consistency
   * on a fresh session (e.g. right after the first profile fetch following login). Skipped if
   * the user has ever manually chosen a language on this device (this session or a past one) —
   * their explicit choice always wins over a stale server value — and applies at most once per
   * session even then, so repeat profile fetches don't keep re-triggering it.
   */
  async syncFromAccount(locale: string | null | undefined): Promise<void> {
    if (this._accountSyncedOnce || this._userChangedThisSession) return;
    this._accountSyncedOnce = true;

    const userSet = await this._storage.get<boolean>(StoragePaths.LOCALE_USER_SET);
    if (userSet) return;

    if ((locale === 'en' || locale === 'sq') && locale !== this.locale()) {
      this.locale.set(locale);
      await this._storage.set(StoragePaths.LOCALE, locale);
    }
  }

  translate(key: string, params?: Record<string, string | number>): string {
    let value = this._lookup(DICTIONARIES[this.locale()], key) ?? this._lookup(DICTIONARIES.en, key) ?? key;

    if (params) {
      for (const [param, replacement] of Object.entries(params)) {
        value = value.replace(new RegExp(`{{\\s*${param}\\s*}}`, 'g'), String(replacement));
      }
    }

    return value;
  }

  private _lookup(dict: unknown, key: string): string | undefined {
    const result = key.split('.').reduce<unknown>((acc, part) => {
      return acc && typeof acc === 'object' ? (acc as Record<string, unknown>)[part] : undefined;
    }, dict);
    return typeof result === 'string' ? result : undefined;
  }
}
