import {inject, Injectable} from '@angular/core';
import {HttpService} from './http.service';
import {SensorDto, SensorReadingDto} from '../models/sensor-dto';

interface SensorListResponse {
  data: SensorDto[];
}

interface SensorReadingListResponse {
  data: SensorReadingDto[];
}

@Injectable({
  providedIn: 'root'
})
export class SensorService {
  private _httpService = inject(HttpService);

  async getByGreenhouse(greenhouseId: number): Promise<SensorDto[]> {
    const response = await this._httpService.get<SensorListResponse>(`greenhouses/${greenhouseId}/sensors`);
    return response.data;
  }

  async getLatestReading(sensorId: number): Promise<SensorReadingDto | null> {
    const response = await this._httpService.get<SensorReadingListResponse>(`sensors/${sensorId}/readings`);
    return response.data[0] ?? null;
  }

  async getReadings(sensorId: number, from: Date, to: Date): Promise<SensorReadingDto[]> {
    const response = await this._httpService.get<SensorReadingListResponse>(
      `sensors/${sensorId}/readings`,
      {from: from.toISOString().slice(0, 10), to: to.toISOString().slice(0, 10)}
    );
    return response.data;
  }
}
