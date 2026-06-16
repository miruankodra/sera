export interface SensorDto {
  id: number;
  greenhouse_id: number;
  name: string;
  type: string;
  unit: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SensorReadingDto {
  id: number;
  sensor_id: number;
  value: number;
  recorded_at: string;
  created_at: string;
}
