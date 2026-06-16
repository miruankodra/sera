import {inject, Injectable} from '@angular/core';
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
import {Subject} from 'rxjs';
import {environment} from '../../environments/environment';
import {StorageService} from './storage.service';
import {StoragePaths} from '../models/constants/storage-paths';
import {WsAlertFiredEvent, WsDeviceStatusEvent, WsSensorReadingEvent} from '../models/ws-events';

(window as any)['Pusher'] = Pusher;

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  private _storageService = inject(StorageService);
  private _echo: Echo<'reverb'> | null = null;
  private _subscribedChannels = new Set<number>();

  private _sensorReading$ = new Subject<WsSensorReadingEvent>();
  private _deviceStatus$ = new Subject<WsDeviceStatusEvent>();
  private _alertFired$ = new Subject<WsAlertFiredEvent>();

  readonly sensorReading$ = this._sensorReading$.asObservable();
  readonly deviceStatus$ = this._deviceStatus$.asObservable();
  readonly alertFired$ = this._alertFired$.asObservable();

  async subscribe(greenhouseId: number): Promise<void> {
    if (this._subscribedChannels.has(greenhouseId)) return;

    if (!this._echo) {
      await this._initEcho();
    }

    this._echo!
      .private(`greenhouse.${greenhouseId}`)
      .listen('NewSensorReading', (data: WsSensorReadingEvent) => this._sensorReading$.next(data))
      .listen('DeviceStatusChanged', (data: WsDeviceStatusEvent) => this._deviceStatus$.next(data))
      .listen('AlertFired', (data: WsAlertFiredEvent) => this._alertFired$.next(data));

    this._subscribedChannels.add(greenhouseId);
  }

  unsubscribe(greenhouseId: number): void {
    if (!this._subscribedChannels.has(greenhouseId)) return;
    this._echo?.leave(`greenhouse.${greenhouseId}`);
    this._subscribedChannels.delete(greenhouseId);
  }

  private async _initEcho(): Promise<void> {
    const token = await this._storageService.get<string>(StoragePaths.AUTHORIZATION_TOKEN);
    const {key, wsHost, wsPort, authEndpoint} = environment.REVERB;

    this._echo = new Echo({
      broadcaster: 'reverb',
      key,
      wsHost,
      wsPort,
      wssPort: wsPort,
      forceTLS: false,
      enabledTransports: ['ws', 'wss'],
      authEndpoint,
      auth: {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      },
    });
  }
}
