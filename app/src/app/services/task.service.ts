import {Injectable, inject, signal} from '@angular/core';
import {StorageService} from './storage.service';
import {StoragePaths} from '../models/constants/storage-paths';
import {GreenhouseTask} from '../models/greenhouse-task';

export interface GreenhouseAction {
  name: string;
  options?: string[];
}

export interface GreenhouseDevice {
  id: string;
  name: string;
  actions: GreenhouseAction[];
}

@Injectable({providedIn: 'root'})
export class TaskService {
  private readonly storage = inject(StorageService);

  // TODO: replace with API call to fetch greenhouses/devices
  readonly greenhouses: GreenhouseDevice[] = [
    {
      id: 'gh1',
      name: 'Greenhouse A',
      actions: [
        {name: 'Turn On Lights'},
        {name: 'Turn Off Lights'},
        {name: 'Run Pump', options: ['15 min', '30 min', '60 min']},
        {name: 'Open Vents', options: ['Zone A', 'Zone B', 'All Zones']},
        {name: 'Close Vents', options: ['Zone A', 'Zone B', 'All Zones']},
      ],
    },
    {
      id: 'gh2',
      name: 'Greenhouse B',
      actions: [
        {name: 'Turn On Lights'},
        {name: 'Turn Off Lights'},
        {name: 'Run Irrigation', options: ['10 min', '20 min', '30 min']},
      ],
    },
    {
      id: 'gh3',
      name: 'Greenhouse C',
      actions: [
        {name: 'Turn On Heating'},
        {name: 'Turn Off Heating'},
        {name: 'Activate CO2 Injector', options: ['Low', 'Medium', 'High']},
      ],
    },
  ];

  private readonly _tasks = signal<GreenhouseTask[]>([]);
  readonly tasks = this._tasks.asReadonly();

  // Plain getter so new Date() is evaluated on each call, not frozen at first computation
  get tasksForToday(): GreenhouseTask[] {
    return this.tasksForDay(new Date());
  }

  tasksForDay(date: Date): GreenhouseTask[] {
    return this._tasks().filter(t => this.isInRange(new Date(t.date), t.endDate ? new Date(t.endDate) : undefined, date));
  }

  async loadTasks(): Promise<void> {
    try {
      const stored = await this.storage.get<GreenhouseTask[]>(StoragePaths.TASKS);
      if (stored) {
        // Revive date strings to Date objects after JSON deserialization
        this._tasks.set(stored.map(t => ({
          ...t,
          date: new Date(t.date),
          endDate: t.endDate ? new Date(t.endDate) : undefined,
        })));
      }
    } catch {
      // Storage unavailable or corrupted; start with empty task list
    }
  }

  async add(task: GreenhouseTask): Promise<void> {
    this._tasks.update(tasks => [...tasks, task]);
    await this.persist();
  }

  async update(task: GreenhouseTask): Promise<void> {
    this._tasks.update(tasks => tasks.map(t => t.id === task.id ? task : t));
    await this.persist();
  }

  async remove(id: string): Promise<void> {
    this._tasks.update(tasks => tasks.filter(t => t.id !== id));
    await this.persist();
  }

  private async persist(): Promise<void> {
    await this.storage.set(StoragePaths.TASKS, this._tasks());
  }

  private isInRange(start: Date, end: Date | undefined, target: Date): boolean {
    const startDay = new Date(start.getFullYear(), start.getMonth(), start.getDate());
    const targetDay = new Date(target.getFullYear(), target.getMonth(), target.getDate());
    if (!end) return startDay.getTime() === targetDay.getTime();
    const endDay = new Date(end.getFullYear(), end.getMonth(), end.getDate());
    return targetDay >= startDay && targetDay <= endDay;
  }

  private isSameDay(a: Date, b: Date): boolean {
    return a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate();
  }
}
