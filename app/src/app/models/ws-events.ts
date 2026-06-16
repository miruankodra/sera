export interface WsSensorReadingEvent {
  sensor_id: number;
  type: string;
  value: number;
  unit: string;
  recorded_at: string;
}

export interface WsDeviceStatusEvent {
  device_id: number;
  status: boolean;
  changed_at: string | null;
}

export interface WsAlertFiredEvent {
  alert_id: number;
  greenhouse_id: number;
  sensor_type: string;
  value: number;
  threshold: number;
  message: string;
}
