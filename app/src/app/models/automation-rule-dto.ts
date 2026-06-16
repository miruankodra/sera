export interface AutomationRuleDto {
  id: number;
  greenhouse_id: number;
  trigger_sensor_id: number;
  operator: string;
  threshold: string;
  action_device_id: number;
  action: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateAutomationRuleDto {
  trigger_sensor_id: number;
  operator: string;
  threshold: number;
  action_device_id: number;
  action: string;
}
