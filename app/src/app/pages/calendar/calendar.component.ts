import {Component, computed, inject, OnInit, signal} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {LucideAngularModule, Plus, X} from 'lucide-angular';
import {Capacitor} from '@capacitor/core';
import {LocalNotifications} from '@capacitor/local-notifications';
import {TaskService} from '../../services/task.service';
import {GreenhouseTask, TaskForm, emptyTaskForm, toLocalDateString} from '../../models/greenhouse-task';
import {SeCalendarGridComponent} from '../../components/calendar/se-calendar-grid/se-calendar-grid.component';
import {SeTodayStripComponent} from '../../components/calendar/se-today-strip/se-today-strip.component';
import {SeTaskListComponent} from '../../components/calendar/se-task-list/se-task-list.component';
import {SeSwitchComponent} from '../../components/shared/se-switch/se-switch.component';

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [
    FormsModule,
    LucideAngularModule,
    SeCalendarGridComponent,
    SeTodayStripComponent,
    SeTaskListComponent,
    SeSwitchComponent,
  ],
  templateUrl: './calendar.component.html',
  styleUrl: './calendar.component.scss',
})
export class CalendarComponent implements OnInit {
  readonly PlusIcon = Plus;
  readonly XIcon = X;

  private readonly taskService = inject(TaskService);
  readonly greenhouses = this.taskService.greenhouses;

  readonly today = new Date();
  readonly selectedDate = signal<Date>(new Date());
  readonly showSheet = signal(false);
  readonly editingTask = signal<GreenhouseTask | null>(null);
  readonly form = signal<TaskForm>(emptyTaskForm(new Date()));

  readonly allTasks = this.taskService.tasks;

  readonly selectedDayTasks = computed(() => {
    const date = this.selectedDate();
    return this.taskService.tasks().filter(t => this.isSameDay(new Date(t.date), date));
  });

  readonly todayTasks = computed(() =>
    this.taskService.tasks().filter(t => this.isSameDay(new Date(t.date), new Date()))
  );

  readonly availableActions = computed(() => {
    const gh = this.taskService.greenhouses.find(g => g.id === this.form().device);
    return gh ? gh.actions : [];
  });

  async ngOnInit(): Promise<void> {
    await this.taskService.loadTasks();
  }

  onDaySelected(date: Date): void {
    this.selectedDate.set(date);
  }

  onTodayChipSelected(_taskId: string): void {
    this.selectedDate.set(new Date());
  }

  openCreateSheet(): void {
    this.form.set(emptyTaskForm(this.selectedDate()));
    this.editingTask.set(null);
    this.showSheet.set(true);
  }

  openEditSheet(task: GreenhouseTask): void {
    const d = new Date(task.date);
    this.form.set({
      title: task.title,
      date: toLocalDateString(d),
      time: task.time,
      type: task.type,
      note: task.note ?? '',
      notificationEnabled: task.notificationEnabled ?? false,
      device: task.device ?? '',
      action: task.action ?? '',
      duration: task.duration ?? null,
      zone: task.zone ?? '',
      recurring: task.recurring ?? 'none',
      recurringIntervalDays: task.recurringIntervalDays ?? null,
    });
    this.editingTask.set(task);
    this.showSheet.set(true);
  }

  closeSheet(): void {
    this.showSheet.set(false);
    this.editingTask.set(null);
  }

  updateForm<K extends keyof TaskForm>(key: K, value: TaskForm[K]): void {
    this.form.update(f => ({...f, [key]: value}));
  }

  onDeviceChange(deviceId: string): void {
    this.form.update(f => ({...f, device: deviceId, action: ''}));
  }

  async submitForm(): Promise<void> {
    const f = this.form();
    if (!f.title.trim()) return;

    const isEditing = !!this.editingTask();
    const task: GreenhouseTask = {
      id: isEditing ? this.editingTask()!.id : crypto.randomUUID(),
      title: f.title.trim(),
      date: new Date(f.date),
      time: f.time,
      type: f.type,
      note: f.note || undefined,
      notificationEnabled: f.notificationEnabled,
      device: f.device || undefined,
      action: f.action || undefined,
      duration: f.duration ?? undefined,
      zone: f.zone || undefined,
      recurring: f.recurring,
      recurringIntervalDays: f.recurringIntervalDays ?? undefined,
    };

    if (isEditing) {
      await this.taskService.update(task);
      // Cancel previous notification; re-scheduling happens below if still enabled.
      // Note: cancelNotification is a no-op on web — notification management is native-only.
      await this.cancelNotification(task.id);
    } else {
      await this.taskService.add(task);
    }

    if (task.type === 'reminder' && task.notificationEnabled) {
      await this.scheduleNotification(task);
    }

    this.closeSheet();
  }

  async deleteTask(taskId: string): Promise<void> {
    await this.cancelNotification(taskId);
    await this.taskService.remove(taskId);
  }

  private async scheduleNotification(task: GreenhouseTask): Promise<void> {
    if (!Capacitor.isNativePlatform()) return;

    const {display} = await LocalNotifications.checkPermissions();
    if (display !== 'granted') {
      const {display: result} = await LocalNotifications.requestPermissions();
      if (result !== 'granted') return;
    }

    const at = new Date(task.date);
    const [hours, minutes] = task.time.split(':').map(Number);
    at.setHours(hours, minutes, 0, 0);

    await LocalNotifications.schedule({
      notifications: [{
        id: this.taskIdToNotificationId(task.id),
        title: task.title,
        body: task.note ?? 'Greenhouse reminder',
        schedule: {at},
      }],
    });
  }

  private async cancelNotification(taskId: string): Promise<void> {
    if (!Capacitor.isNativePlatform()) return;
    await LocalNotifications.cancel({
      notifications: [{id: this.taskIdToNotificationId(taskId)}],
    });
  }

  private taskIdToNotificationId(id: string): number {
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
      hash = ((hash << 5) - hash) + id.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash);
  }

  private isSameDay(a: Date, b: Date): boolean {
    return a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate();
  }
}
