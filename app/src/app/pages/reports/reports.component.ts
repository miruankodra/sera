import {Component, computed, inject, OnInit, signal} from '@angular/core';
import {DecimalPipe} from '@angular/common';
import {GreenhouseService} from '../../services/greenhouse.service';
import {SensorService} from '../../services/sensor.service';
import {AlertService} from '../../services/alert.service';
import {GreenhouseDto} from '../../models/greenhouse-dto';
import {SensorDto, SensorReadingDto} from '../../models/sensor-dto';
import {AlertDto} from '../../models/alert-dto';
import {SeSensorChartComponent} from '../../components/se-sensor-chart/se-sensor-chart.component';
import {HttpService} from '../../services/http.service';
import {TranslationService} from '../../services/translation.service';
import {TranslatePipe} from '../../pipes/translate.pipe';

interface SensorReport {
  sensor: SensorDto;
  readings: SensorReadingDto[];
  avg: number;
  min: number;
  max: number;
  current: number | null;
}

interface TaskSummary {
  total: number;
  completed: number;
}

interface ApiTaskListResponse {
  data: {is_completed: boolean}[];
}

const SENSOR_COLORS: Record<string, string> = {
  temperature: '#ef4444',
  humidity: '#3b82f6',
  soil_moisture: '#22c55e',
  light: '#f59e0b',
};

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [SeSensorChartComponent, DecimalPipe, TranslatePipe],
  templateUrl: './reports.component.html',
  styleUrl: './reports.component.scss',
})
export class ReportsComponent implements OnInit {
  private readonly _greenhouseService = inject(GreenhouseService);
  private readonly _sensorService = inject(SensorService);
  private readonly _alertService = inject(AlertService);
  private readonly _http = inject(HttpService);
  private readonly _translation = inject(TranslationService);

  readonly greenhouses = signal<GreenhouseDto[]>([]);
  readonly selectedGreenhouseId = signal<number | null>(null);
  readonly period = signal<7 | 14 | 30>(7);
  readonly loading = signal(false);

  readonly sensorReports = signal<SensorReport[]>([]);
  readonly alerts = signal<AlertDto[]>([]);
  readonly taskSummary = signal<TaskSummary | null>(null);

  readonly unreadAlerts = computed(() => this.alerts().filter(a => !a.is_read).length);
  readonly recentAlerts = computed(() => this.alerts().slice(0, 5));

  readonly taskCompletionPct = computed(() => {
    const s = this.taskSummary();
    if (!s || s.total === 0) return 0;
    return Math.round((s.completed / s.total) * 100);
  });

  async ngOnInit(): Promise<void> {
    const greenhouses = await this._greenhouseService.getAll();
    this.greenhouses.set(greenhouses);
    if (greenhouses.length > 0) {
      this.selectedGreenhouseId.set(greenhouses[0].id);
      await this._loadReport();
    }
  }

  async onGreenhouseChangeEvent(event: Event): Promise<void> {
    const id = (event.target as HTMLSelectElement).value;
    this.selectedGreenhouseId.set(Number(id));
    await this._loadReport();
  }

  async onPeriodChange(days: number): Promise<void> {
    this.period.set(days as 7 | 14 | 30);
    await this._loadReport();
  }

  sensorColor(type: string): string {
    return SENSOR_COLORS[type] ?? '#1A9E78';
  }

  sensorEmoji(type: string): string {
    const map: Record<string, string> = {
      temperature: '🌡️', humidity: '💧', soil_moisture: '🌱', light: '☀️',
    };
    return map[type] ?? '📊';
  }

  operatorLabel(op: string): string {
    const map: Record<string, string> = {
      gt: '>', gte: '≥', lt: '<', lte: '≤', eq: '=',
    };
    return map[op] ?? op;
  }

  sensorTypeLabel(type: string): string {
    return this._translation.translate(`sensorTypes.${type}`);
  }

  timeAgo(iso: string): string {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return this._translation.translate('common.justNow');
    if (mins < 60) return this._translation.translate('common.minutesAgo', {count: mins});
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return this._translation.translate('common.hoursAgo', {count: hrs});
    return this._translation.translate('common.daysAgo', {count: Math.floor(hrs / 24)});
  }

  private async _loadReport(): Promise<void> {
    const id = this.selectedGreenhouseId();
    if (!id) return;

    this.loading.set(true);
    this.sensorReports.set([]);
    this.alerts.set([]);
    this.taskSummary.set(null);

    try {
      const to = new Date();
      const from = new Date();
      from.setDate(from.getDate() - this.period());

      const [sensors, alerts, taskResp] = await Promise.all([
        this._sensorService.getByGreenhouse(id),
        this._alertService.getByGreenhouse(id),
        this._http.get<ApiTaskListResponse>(`greenhouses/${id}/tasks`),
      ]);

      this.alerts.set(alerts);

      const tasks = taskResp.data;
      this.taskSummary.set({
        total: tasks.length,
        completed: tasks.filter(t => t.is_completed).length,
      });

      const reports = await Promise.all(
        sensors.map(async (sensor): Promise<SensorReport> => {
          const readings = await this._sensorService.getReadings(sensor.id, from, to);
          const values = readings.map(r => Number(r.value));
          return {
            sensor,
            readings,
            avg: values.length ? Math.round(values.reduce((a, b) => a + b, 0) / values.length) : 0,
            min: values.length ? Math.round(Math.min(...values)) : 0,
            max: values.length ? Math.round(Math.max(...values)) : 0,
            current: readings.length ? Math.round(Number(readings[0].value)) : null,
          };
        })
      );

      this.sensorReports.set(reports);
    } finally {
      this.loading.set(false);
    }
  }
}
