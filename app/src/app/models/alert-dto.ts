export interface AlertDto {
  id: number;
  greenhouse_id: number;
  sensor_id: number;
  sensor_type: string;
  value: string;
  threshold: string;
  operator: string;
  message: string;
  is_read: boolean;
  triggered_at: string;
  created_at: string;
}
