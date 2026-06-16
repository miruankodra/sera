import {inject, Injectable} from '@angular/core';
import {HttpService} from './http.service';
import {HttpPaths} from '../models/constants/http-paths';
import {ChangePasswordDto, UpdateUserDto, UserDto} from '../models/user-dto';

interface UserResponse {
  data: UserDto;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private _httpService = inject(HttpService);

  async getProfile(): Promise<UserDto> {
    const response = await this._httpService.get<UserResponse>(HttpPaths.USER);
    return response.data;
  }

  async updateProfile(data: UpdateUserDto): Promise<UserDto> {
    const response = await this._httpService.put<UserResponse>(HttpPaths.USER, data);
    return response.data;
  }

  async changePassword(data: ChangePasswordDto): Promise<void> {
    await this._httpService.put<void>(HttpPaths.USER_PASSWORD, data);
  }

  async deleteAvatar(): Promise<void> {
    await this._httpService.delete<void>(HttpPaths.USER_AVATAR);
  }
}
