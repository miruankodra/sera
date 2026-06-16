export interface GreenhouseTask {
  id: string;
  greenhouse_id: number;
  title: string;
  date: Date;
  endDate?: Date;
  time: string; // "HH:mm"
  type: 'reminder' | 'system_command';
  note?: string;
  notificationEnabled?: boolean;
  device?: string;       // device_id as string (system_command only)
  action?: string;       // turn_on | turn_off
  duration?: number;     // minutes
  zone?: string;
  recurring?: 'none' | 'daily' | 'weekly' | 'custom';
  recurringIntervalDays?: number;
  isCompleted?: boolean;
}

export interface TaskForm {
  greenhouse_id: string;
  title: string;
  date: string;       // "YYYY-MM-DD"
  endDate: string;    // "YYYY-MM-DD" or empty
  time: string;       // "HH:mm"
  type: 'reminder' | 'system_command';
  note: string;
  notificationEnabled: boolean;
  device: string;     // device_id for system_command
  action: string;     // turn_on | turn_off
  duration: number | null;
  zone: string;
  recurring: 'none' | 'daily' | 'weekly' | 'custom';
  recurringIntervalDays: number | null;
}

const padTwo = (n: number): string => String(n).padStart(2, '0');
export const toLocalDateString = (d: Date): string =>
  `${d.getFullYear()}-${padTwo(d.getMonth() + 1)}-${padTwo(d.getDate())}`;

export const emptyTaskForm = (date: Date, defaultGreenhouseId = ''): TaskForm => ({
  greenhouse_id: defaultGreenhouseId,
  title: '',
  date: toLocalDateString(date),
  endDate: '',
  time: '08:00',
  type: 'reminder',
  note: '',
  notificationEnabled: false,
  device: '',
  action: '',
  duration: null,
  zone: '',
  recurring: 'none',
  recurringIntervalDays: null,
});
