import {inject, Injectable} from '@angular/core';
import {HttpService} from './http.service';
import {HttpPaths} from '../models/constants/http-paths';
import {AlertDto} from '../models/alert-dto';

interface AlertListResponse {
  data: AlertDto[];
}

@Injectable({
  providedIn: 'root'
})
export class AlertService {
  private _httpService = inject(HttpService);

  async getByGreenhouse(greenhouseId: number): Promise<AlertDto[]> {
    const response = await this._httpService.get<AlertListResponse>(
      `greenhouses/${greenhouseId}/alerts`
    );
    return response.data;
  }

  async markAsRead(alertId: number): Promise<void> {
    await this._httpService.post<void>(`${HttpPaths.ALERTS_READ}/${alertId}/read`, {});
  }
}
