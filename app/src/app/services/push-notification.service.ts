import {inject, Injectable} from '@angular/core';
import {Capacitor} from '@capacitor/core';
import {PushNotifications} from '@capacitor/push-notifications';
import {initializeApp} from 'firebase/app';
import {getMessaging, getToken, onMessage} from 'firebase/messaging';
import {HttpService} from './http.service';

const FIREBASE_CONFIG = {
  apiKey: 'AIzaSyDFxzoZTWx5dYA7GhRIe71oc5aEL48udR0',
  authDomain: 'sera-app-25bf5.firebaseapp.com',
  projectId: 'sera-app-25bf5',
  storageBucket: 'sera-app-25bf5.firebasestorage.app',
  messagingSenderId: '1087432820238',
  appId: '1:1087432820238:web:8a34b40289f0efe0e31e5f',
};

const VAPID_KEY = 'BOm7Vy3YF3SUayZKfXFpaOqMsXw_Hh-Nn-CNUbW84mZWe1doip1xPM0MR71Szfq_-tCJNVkZMQxkSln8D57WRko';

@Injectable({providedIn: 'root'})
export class PushNotificationService {
  private readonly _http = inject(HttpService);
  private _token: string | null = null;

  async initialize(): Promise<void> {
    if (Capacitor.isNativePlatform()) {
      await this._initNative();
    } else {
      await this._initWeb();
    }
  }

  async unregister(): Promise<void> {
    if (!this._token) return;
    try {
      await this._http.delete('user/device-token', {token: this._token});
    } catch {}
    this._token = null;
  }

  private async _initNative(): Promise<void> {
    const {receive} = await PushNotifications.requestPermissions();
    if (receive !== 'granted') return;

    await PushNotifications.register();

    PushNotifications.addListener('registration', async ({value}) => {
      await this._sendToken(value, 'android');
    });

    PushNotifications.addListener('registrationError', (err) => {
      console.error('Push registration error', err);
    });
  }

  private async _initWeb(): Promise<void> {
    if (!('Notification' in window) || !('serviceWorker' in navigator)) return;

    const permission = await Notification.requestPermission();
    if (permission !== 'granted') return;

    try {
      const app = initializeApp(FIREBASE_CONFIG);
      const messaging = getMessaging(app);

      const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');

      const token = await getToken(messaging, {
        vapidKey: VAPID_KEY,
        serviceWorkerRegistration: registration,
      });

      if (token) {
        await this._sendToken(token, 'web');
      }

      onMessage(messaging, (payload) => {
        const title = payload.notification?.title ?? 'Alert';
        const body = payload.notification?.body ?? '';
        new Notification(title, {body, icon: '/assets/icons/icon-192x192.png'});
      });
    } catch (err) {
      console.error('Web push init failed', err);
    }
  }

  private async _sendToken(token: string, platform: 'android' | 'web'): Promise<void> {
    try {
      await this._http.post('user/device-token', {token, platform});
      this._token = token;
    } catch {}
  }
}
