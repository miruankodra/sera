import {Injectable, inject, signal} from '@angular/core';
import {StorageService} from './storage.service';
import {StoragePaths} from '../models/constants/storage-paths';
import {GreenhouseTask} from '../models/greenhouse-task';

export interface GreenhouseDevice {
  id: string;
  name: string;
  actions: string[];
}

@Injectable({providedIn: 'root'})
export class TaskService {
  private readonly storage = inject(StorageService);

  // TODO: replace with API call to fetch greenhouses/devices
  readonly greenhouses: GreenhouseDevice[] = [
    {
      id: 'gh1',
      name: 'Greenhouse A',
      actions: ['Turn On Lights', 'Turn Off Lights', 'Run Pump 15 min', 'Run Pump 30 min', 'Open Vents', 'Close Vents'],
    },
    {
      id: 'gh2',
      name: 'Greenhouse B',
      actions: ['Turn On Lights', 'Turn Off Lights', 'Run Irrigation 10 min', 'Run Irrigation 20 min'],
    },
    {
      id: 'gh3',
      name: 'Greenhouse C',
      actions: ['Turn On Heating', 'Turn Off Heating', 'Activate CO2 Injector'],
    },
  ];

  private readonly _tasks = signal<GreenhouseTask[]>([]);
  readonly tasks = this._tasks.asReadonly();

  // Plain getter so new Date() is evaluated on each call, not frozen at first computation
  get tasksForToday(): GreenhouseTask[] {
    return this.tasksForDay(new Date());
  }

  tasksForDay(date: Date): GreenhouseTask[] {
    return this._tasks().filter(t => this.isSameDay(new Date(t.date), date));
  }

  async loadTasks(): Promise<void> {
    try {
      const stored = await this.storage.get<GreenhouseTask[]>(StoragePaths.TASKS);
      if (stored) {
        // Revive date strings to Date objects after JSON deserialization
        this._tasks.set(stored.map(t => ({...t, date: new Date(t.date)})));
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

  private isSameDay(a: Date, b: Date): boolean {
    return a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate();
  }
}
