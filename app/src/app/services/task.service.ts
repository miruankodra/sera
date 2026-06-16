import {Injectable, inject, signal} from '@angular/core';
import {HttpService} from './http.service';
import {GreenhouseService} from './greenhouse.service';
import {DeviceService} from './device.service';
import {GreenhouseDto} from '../models/greenhouse-dto';
import {DeviceDto} from '../models/device-dto';
import {GreenhouseTask} from '../models/greenhouse-task';

interface ApiTask {
  id: number;
  greenhouse_id: number;
  title: string;
  type: 'reminder' | 'system_command';
  payload: Record<string, unknown>;
  scheduled_at: string;
  is_completed: boolean;
}

interface ApiTaskListResponse {
  data: ApiTask[];
}

interface ApiTaskResponse {
  data: ApiTask;
}

@Injectable({providedIn: 'root'})
export class TaskService {
  private readonly _http = inject(HttpService);
  private readonly _greenhouseService = inject(GreenhouseService);
  private readonly _deviceService = inject(DeviceService);

  private readonly _tasks = signal<GreenhouseTask[]>([]);
  private readonly _greenhouses = signal<GreenhouseDto[]>([]);
  private readonly _devicesByGreenhouse = signal<Map<number, DeviceDto[]>>(new Map());

  readonly tasks = this._tasks.asReadonly();
  readonly greenhouses = this._greenhouses.asReadonly();
  readonly devicesByGreenhouse = this._devicesByGreenhouse.asReadonly();

  async loadTasks(): Promise<void> {
    const greenhouses = await this._greenhouseService.getAll();
    this._greenhouses.set(greenhouses);

    const allTasks: GreenhouseTask[] = [];
    await Promise.all(greenhouses.map(async (gh) => {
      try {
        const response = await this._http.get<ApiTaskListResponse>(`greenhouses/${gh.id}/tasks`);
        allTasks.push(...response.data.map(t => this._fromApi(t)));
      } catch {
        // skip greenhouse if tasks can't be loaded
      }
    }));

    allTasks.sort((a, b) => a.date.getTime() - b.date.getTime());
    this._tasks.set(allTasks);
  }

  async loadDevicesForGreenhouse(greenhouseId: number): Promise<DeviceDto[]> {
    const existing = this._devicesByGreenhouse().get(greenhouseId);
    if (existing) return existing;

    const devices = await this._deviceService.getByGreenhouse(greenhouseId);
    this._devicesByGreenhouse.update(m => new Map(m).set(greenhouseId, devices));
    return devices;
  }

  async add(task: GreenhouseTask): Promise<void> {
    const response = await this._http.post<ApiTaskResponse>(
      `greenhouses/${task.greenhouse_id}/tasks`,
      this._toApi(task)
    );
    const saved = this._fromApi(response.data);
    this._tasks.update(list => [...list, saved]);
  }

  async update(task: GreenhouseTask): Promise<void> {
    const apiId = task.id;
    await this._http.put<ApiTaskResponse>(`tasks/${apiId}`, this._toApi(task));
    this._tasks.update(list => list.map(t => t.id === task.id ? task : t));
  }

  async remove(id: string): Promise<void> {
    await this._http.delete(`tasks/${id}`);
    this._tasks.update(list => list.filter(t => t.id !== id));
  }

  tasksForDay(date: Date): GreenhouseTask[] {
    return this._tasks().filter(t =>
      this._isInRange(new Date(t.date), t.endDate ? new Date(t.endDate) : undefined, date)
    );
  }

  get tasksForToday(): GreenhouseTask[] {
    return this.tasksForDay(new Date());
  }

  private _toApi(task: GreenhouseTask): object {
    const [hours, minutes] = task.time.split(':').map(Number);
    const scheduledAt = new Date(task.date);
    scheduledAt.setHours(hours, minutes, 0, 0);

    const payload: Record<string, unknown> =
      task.type === 'reminder'
        ? {message: task.note ?? ''}
        : {device_id: Number(task.device), action: task.action, duration: task.duration};

    if (task.endDate) payload['endDate'] = task.endDate.toISOString();
    if (task.zone) payload['zone'] = task.zone;
    if (task.recurring && task.recurring !== 'none') payload['recurring'] = task.recurring;
    if (task.recurringIntervalDays) payload['recurringIntervalDays'] = task.recurringIntervalDays;
    if (task.notificationEnabled) payload['notificationEnabled'] = task.notificationEnabled;

    return {
      title: task.title,
      type: task.type,
      payload,
      scheduled_at: scheduledAt.toISOString(),
    };
  }

  private _fromApi(t: ApiTask): GreenhouseTask {
    const d = new Date(t.scheduled_at);
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');

    const payload = t.payload ?? {};

    return {
      id: String(t.id),
      greenhouse_id: t.greenhouse_id,
      title: t.title,
      type: t.type,
      date: new Date(d.getFullYear(), d.getMonth(), d.getDate()),
      time: `${hours}:${minutes}`,
      endDate: payload['endDate'] ? new Date(payload['endDate'] as string) : undefined,
      note: t.type === 'reminder' ? (payload['message'] as string | undefined) : undefined,
      device: t.type === 'system_command' ? String(payload['device_id'] ?? '') : undefined,
      action: t.type === 'system_command' ? (payload['action'] as string | undefined) : undefined,
      duration: t.type === 'system_command' ? (payload['duration'] as number | undefined) : undefined,
      zone: payload['zone'] as string | undefined,
      recurring: (payload['recurring'] as GreenhouseTask['recurring']) ?? 'none',
      recurringIntervalDays: payload['recurringIntervalDays'] as number | undefined,
      notificationEnabled: !!(payload['notificationEnabled']),
      isCompleted: t.is_completed,
    };
  }

  private _isInRange(start: Date, end: Date | undefined, target: Date): boolean {
    const startDay = new Date(start.getFullYear(), start.getMonth(), start.getDate());
    const targetDay = new Date(target.getFullYear(), target.getMonth(), target.getDate());
    if (!end) return startDay.getTime() === targetDay.getTime();
    const endDay = new Date(end.getFullYear(), end.getMonth(), end.getDate());
    return targetDay >= startDay && targetDay <= endDay;
  }
}
