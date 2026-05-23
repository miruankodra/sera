export interface GreenhouseTask {
  id: string;
  title: string;
  date: Date;
  endDate?: Date;     // optional end of date range
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
  endDate: string;    // "YYYY-MM-DD" or empty string (no end date)
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
export const toLocalDateString = (d: Date): string =>
  `${d.getFullYear()}-${padTwo(d.getMonth() + 1)}-${padTwo(d.getDate())}`;

export const emptyTaskForm = (date: Date): TaskForm => ({
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
