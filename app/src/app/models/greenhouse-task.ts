export interface GreenhouseTask {
  id: string;
  title: string;
  date: Date;
  time: string; // "HH:mm"
  type: 'reminder' | 'system_command';
  note?: string;
  notificationEnabled?: boolean;
  device?: string;
  action?: string;
  duration?: number; // minutes
  zone?: string;
  recurring?: 'none' | 'daily' | 'weekly' | 'custom';
  recurringIntervalDays?: number;
}

export interface TaskForm {
  title: string;
  date: string;       // "YYYY-MM-DD"
  time: string;       // "HH:mm"
  type: 'reminder' | 'system_command';
  note: string;
  notificationEnabled: boolean;
  device: string;
  action: string;
  duration: number | null;
  zone: string;
  recurring: 'none' | 'daily' | 'weekly' | 'custom';
  recurringIntervalDays: number | null;
}

const padTwo = (n: number): string => String(n).padStart(2, '0');
const toLocalDateString = (d: Date): string =>
  `${d.getFullYear()}-${padTwo(d.getMonth() + 1)}-${padTwo(d.getDate())}`;

export const emptyTaskForm = (date: Date): TaskForm => ({
  title: '',
  date: toLocalDateString(date),
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
