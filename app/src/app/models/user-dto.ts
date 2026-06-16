export interface UserDto {
  id: number;
  name: string;
  email: string;
  avatar_url: string | null;
  timezone: string;
  locale: string;
  notification_preferences: {
    alerts: boolean;
    automation: boolean;
    tasks: boolean;
  } | null;
  greenhouses_count: number;
  created_at: string;
}

export interface UpdateUserDto {
  name?: string;
  email?: string;
  timezone?: string;
  locale?: string;
  notification_preferences?: UserDto['notification_preferences'];
}

export interface ChangePasswordDto {
  current_password: string;
  password: string;
  password_confirmation: string;
}
