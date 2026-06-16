import {inject, Injectable} from '@angular/core';
import {HttpService} from './http.service';
import {DeviceDto} from '../models/device-dto';

interface DeviceListResponse {
  data: DeviceDto[];
}

interface DeviceCommandResponse {
  data: DeviceDto;
}

@Injectable({
  providedIn: 'root'
})
export class DeviceService {
  private _httpService = inject(HttpService);

  async getByGreenhouse(greenhouseId: number): Promise<DeviceDto[]> {
    const response = await this._httpService.get<DeviceListResponse>(`greenhouses/${greenhouseId}/devices`);
    return response.data;
  }

  async sendCommand(deviceId: number, action: 'turn_on' | 'turn_off'): Promise<DeviceDto> {
    const response = await this._httpService.post<DeviceCommandResponse>(`devices/${deviceId}/command`, {action});
    return response.data;
  }
}
