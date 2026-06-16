export interface GreenhouseDto {
  id: number;
  user_id: number;
  name: string;
  description: string | null;
  location: string | null;
  created_at: string;
  updated_at: string;
}
