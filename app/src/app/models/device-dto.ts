export interface DeviceDto {
  id: number;
  greenhouse_id: number;
  name: string;
  type: string;
  status: boolean;
  last_commanded_at: string | null;
  created_at: string;
  updated_at: string;
}
