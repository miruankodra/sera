import {inject, Injectable} from '@angular/core';
import {HttpService} from './http.service';
import {HttpPaths} from '../models/constants/http-paths';
import {GreenhouseDto} from '../models/greenhouse-dto';

interface GreenhouseListResponse {
  data: GreenhouseDto[];
}

interface GreenhouseSingleResponse {
  data: GreenhouseDto;
}

@Injectable({
  providedIn: 'root'
})
export class GreenhouseService {
  private _httpService = inject(HttpService);

  async getAll(): Promise<GreenhouseDto[]> {
    const response = await this._httpService.get<GreenhouseListResponse>(HttpPaths.GREENHOUSES);
    return response.data;
  }

  async create(name: string, description?: string, location?: string): Promise<GreenhouseDto> {
    const response = await this._httpService.post<GreenhouseSingleResponse>(
      HttpPaths.GREENHOUSES,
      {name, description, location}
    );
    return response.data;
  }

  async delete(id: number): Promise<void> {
    await this._httpService.delete(`${HttpPaths.GREENHOUSES}/${id}`);
  }
}
