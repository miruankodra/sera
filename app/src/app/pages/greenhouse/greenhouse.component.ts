import {Component, computed, inject, input, InputSignal, OnDestroy, OnInit, signal} from '@angular/core';
import {SeGreenhouseHeaderComponent} from '../../components/se-greenhouse-header/se-greenhouse-header.component';
import {SeGreenhouseInfoComponent} from '../../components/se-greenhouse-info/se-greenhouse-info.component';
import {SeStatisticsCardComponent} from '../../components/se-statistics-card/se-statistics-card.component';
import {SeTabPanelComponent} from '../../components/se-tab-panel/se-tab-panel.component';
import {SePanelTabComponent} from '../../components/se-panel-tab/se-panel-tab.component';
import {SeControlCardComponent} from '../../components/se-control-card/se-control-card.component';
import {SeAlertItemComponent} from '../../components/se-alert-item/se-alert-item.component';
import {GhStatisticsDto} from '../../models/gh-statistics-dto';
import {GreenhouseDto} from '../../models/greenhouse-dto';
import {DeviceDto} from '../../models/device-dto';
import {SensorDto} from '../../models/sensor-dto';
import {AlertDto} from '../../models/alert-dto';
import {AutomationRuleDto, CreateAutomationRuleDto} from '../../models/automation-rule-dto';
import {SensorService} from '../../services/sensor.service';
import {DeviceService} from '../../services/device.service';
import {AlertService} from '../../services/alert.service';
import {AutomationRuleService} from '../../services/automation-rule.service';
import {WebSocketService} from '../../services/web-socket.service';
import {ToastService} from '../../services/toast.service';
import {HttpService} from '../../services/http.service';
import {ModalService} from '../../services/modal.service';
import {TranslationService} from '../../services/translation.service';
import {TranslatePipe} from '../../pipes/translate.pipe';
import {Subscription} from 'rxjs';

type ChartRange = '24h' | '7d' | '30d';

interface ScheduleEntry {
  title: string;
  recurring: 'daily' | 'weekly' | 'custom' | 'once';
  time: string;
}

interface ApiTaskLike {
  title: string;
  type: string;
  payload: Record<string, unknown>;
  scheduled_at: string;
}

interface RuleForm {
  sensor_id: number | null;
  operator: string;
  threshold: string;
  device_id: number | null;
  action: string;
}

const SENSOR_EMOJIS: Record<string, string> = {
  temperature: '🌡️', humidity: '💧', soil_moisture: '🌱', light: '☀️',
};

const SENSOR_COLORS: Record<string, { bg: string; text: string; pill: string }> = {
  temperature:   {bg: 'bg-orange-50',  text: 'text-orange-500',  pill: 'bg-orange-100 text-orange-600'},
  humidity:      {bg: 'bg-blue-50',    text: 'text-blue-500',    pill: 'bg-blue-100 text-blue-600'},
  soil_moisture: {bg: 'bg-green-50',   text: 'text-green-600',   pill: 'bg-green-100 text-green-700'},
  light:         {bg: 'bg-yellow-50',  text: 'text-yellow-500',  pill: 'bg-yellow-100 text-yellow-600'},
};

const DEVICE_EMOJIS: Record<string, string> = {
  fan: '🌀', heater: '🔥', irrigation: '💦', light: '💡',
};

@Component({
  selector: 'se-greenhouse',
  standalone: true,
  imports: [
    SeGreenhouseHeaderComponent,
    SeGreenhouseInfoComponent,
    SeStatisticsCardComponent,
    SeTabPanelComponent,
    SePanelTabComponent,
    SeControlCardComponent,
    SeAlertItemComponent,
    TranslatePipe,
  ],
  templateUrl: './greenhouse.component.html',
  styleUrl: './greenhouse.component.scss',
})
export class GreenhouseComponent implements OnInit, OnDestroy {
  greenhouse: InputSignal<GreenhouseDto> = input.required<GreenhouseDto>();

  private _sensorService    = inject(SensorService);
  private _deviceService    = inject(DeviceService);
  private _alertService     = inject(AlertService);
  private _ruleService      = inject(AutomationRuleService);
  private _wsService        = inject(WebSocketService);
  private _toastService     = inject(ToastService);
  private _httpService      = inject(HttpService);
  private _modalService     = inject(ModalService);
  private _translation      = inject(TranslationService);
  private _subs: Subscription[] = [];

  stats   = signal<GhStatisticsDto[]>([]);
  sensors = signal<SensorDto[]>([]);
  devices = signal<DeviceDto[]>([]);
  alerts  = signal<AlertDto[]>([]);
  rules   = signal<AutomationRuleDto[]>([]);
  loading = signal(true);

  showRuleSheet = signal(false);
  savingRule    = signal(false);

  ruleForm = signal<RuleForm>({
    sensor_id: null, operator: 'gt', threshold: '', device_id: null, action: 'turn_on',
  });

  // Desktop dashboard state
  readonly chartRanges: ChartRange[] = ['24h', '7d', '30d'];
  alertFilter   = signal<'all' | 'critical'>('all');
  chartRange    = signal<ChartRange>('7d');
  sensorValues  = signal<Record<number, number>>({});
  sensorTrends  = signal<Record<number, number[]>>({});
  lastSyncedAt  = signal<string | null>(null);
  scheduleEntries = signal<ScheduleEntry[]>([]);
  private _deviceModeOverrides = signal<Record<number, 'auto' | 'manual'>>({});

  readonly sensorMap = computed(() => new Map(this.sensors().map(s => [s.id, s])));
  readonly deviceMap = computed(() => new Map(this.devices().map(d => [d.id, d])));

  readonly isOnline = computed(() => this.sensors().some(s => s.is_active));

  readonly uptimePct = computed(() => {
    const total = this.sensors().length;
    if (total === 0) return 100;
    return Math.round((this.sensors().filter(s => s.is_active).length / total) * 100);
  });

  readonly filteredAlerts = computed(() =>
    this.alertFilter() === 'critical'
      ? this.alerts().filter(a => this.alertSeverity(a) === 'critical')
      : this.alerts()
  );

  private readonly SENSOR_DEFAULTS: Record<string, { threshold: number; direction: 'over' | 'under' }> = {
    temperature:   { threshold: 28,  direction: 'over' },
    humidity:      { threshold: 85,  direction: 'over' },
    soil_moisture: { threshold: 35,  direction: 'under' },
    light:         { threshold: 500, direction: 'under' },
  };

  readonly selectedSensorUnit = computed(() => {
    const id = this.ruleForm().sensor_id;
    return id ? (this.sensorMap().get(id)?.unit ?? '') : '';
  });

  readonly ruleFormValid = computed(() => {
    const f = this.ruleForm();
    return f.sensor_id !== null && f.device_id !== null &&
           f.threshold !== '' && !isNaN(Number(f.threshold));
  });

  private _sensorMeta = new Map<number, { unit: string; index: number }>();

  async ngOnInit(): Promise<void> {
    const id = this.greenhouse().id;

    const [sensors, devices, alerts, rules] = await Promise.all([
      this._sensorService.getByGreenhouse(id),
      this._deviceService.getByGreenhouse(id),
      this._alertService.getByGreenhouse(id),
      this._ruleService.getByGreenhouse(id),
    ]);

    this.sensors.set(sensors);
    this.devices.set(devices);
    this.alerts.set(alerts);
    this.rules.set(rules);
    await Promise.all([
      this._buildStats(sensors),
      this._loadSensorTrends(),
      this._loadSchedule(id),
    ]);
    this.loading.set(false);

    await this._wsService.subscribe(id);
    this._bindWsEvents();
  }

  ngOnDestroy(): void {
    this._wsService.unsubscribe(this.greenhouse().id);
    this._subs.forEach(s => s.unsubscribe());
  }

  goBack(): void {
    this._modalService.close();
  }

  async sendCommand(device: DeviceDto, isOn: boolean): Promise<void> {
    this.devices.update(list => list.map(d => d.id === device.id ? {...d, status: isOn} : d));
    try {
      const updated = await this._deviceService.sendCommand(device.id, isOn ? 'turn_on' : 'turn_off');
      this.devices.update(list => list.map(d => d.id === updated.id ? updated : d));
    } catch {
      this.devices.update(list => list.map(d => d.id === device.id ? {...d, status: !isOn} : d));
      await this._toastService.fireToast(this._translation.translate('greenhouse.commandFailed'));
    }
  }

  async markAlertRead(alert: AlertDto): Promise<void> {
    if (alert.is_read) return;
    try {
      await this._alertService.markAsRead(alert.id);
      this.alerts.update(list => list.map(a => a.id === alert.id ? {...a, is_read: true} : a));
    } catch { /* silent */ }
  }

  unreadCount(): number {
    return this.alerts().filter(a => !a.is_read).length;
  }

  alertsTabTitle(): string {
    const label = this._translation.translate('greenhouse.alerts');
    return this.unreadCount() > 0 ? `${label} (${this.unreadCount()})` : label;
  }

  openRuleSheet(): void {
    this.ruleForm.set({sensor_id: null, operator: 'gt', threshold: '', device_id: null, action: 'turn_on'});
    this.showRuleSheet.set(true);
  }

  closeRuleSheet(): void {
    this.showRuleSheet.set(false);
  }

  patchRuleForm(patch: Partial<RuleForm>): void {
    this.ruleForm.update(f => ({...f, ...patch}));
  }

  onRuleSensorChange(event: Event): void {
    const val = (event.target as HTMLSelectElement).value;
    this.patchRuleForm({sensor_id: val ? +val : null});
  }

  onRuleOperatorChange(event: Event): void {
    this.patchRuleForm({operator: (event.target as HTMLSelectElement).value});
  }

  onRuleThresholdChange(event: Event): void {
    this.patchRuleForm({threshold: (event.target as HTMLInputElement).value});
  }

  onRuleDeviceChange(event: Event): void {
    const val = (event.target as HTMLSelectElement).value;
    this.patchRuleForm({device_id: val ? +val : null});
  }

  async saveRule(): Promise<void> {
    const f = this.ruleForm();
    if (!f.sensor_id || !f.device_id || !f.threshold) return;

    this.savingRule.set(true);
    try {
      const payload: CreateAutomationRuleDto = {
        trigger_sensor_id: f.sensor_id,
        operator: f.operator,
        threshold: Number(f.threshold),
        action_device_id: f.device_id,
        action: f.action,
      };
      const rule = await this._ruleService.create(this.greenhouse().id, payload);
      this.rules.update(list => [...list, rule]);
      this.closeRuleSheet();
    } catch {
      await this._toastService.fireToast(this._translation.translate('greenhouse.ruleFailed'));
    } finally {
      this.savingRule.set(false);
    }
  }

  async toggleRule(rule: AutomationRuleDto): Promise<void> {
    const next = !rule.is_active;
    this.rules.update(list => list.map(r => r.id === rule.id ? {...r, is_active: next} : r));
    try {
      await this._ruleService.update(rule.id, {is_active: next});
    } catch {
      this.rules.update(list => list.map(r => r.id === rule.id ? {...r, is_active: rule.is_active} : r));
    }
  }

  async deleteRule(rule: AutomationRuleDto): Promise<void> {
    this.rules.update(list => list.filter(r => r.id !== rule.id));
    try {
      await this._ruleService.delete(rule.id);
    } catch {
      this.rules.update(list => [rule, ...list]);
    }
  }

  sensorEmoji(type: string): string {
    return SENSOR_EMOJIS[type] ?? '📊';
  }

  sensorTypeLabel(type: string): string {
    return this._translation.translate(`sensorTypes.${type}`);
  }

  deviceTypeLabel(type: string): string {
    return this._translation.translate(`deviceTypes.${type}`);
  }

  frequencyLabel(recurring: ScheduleEntry['recurring']): string {
    return this._translation.translate(`greenhouse.frequency.${recurring}`);
  }

  sensorColors(type: string): { bg: string; text: string; pill: string } {
    return SENSOR_COLORS[type] ?? {bg: 'bg-gray-50', text: 'text-gray-500', pill: 'bg-gray-100 text-gray-600'};
  }

  deviceEmoji(type: string): string {
    return DEVICE_EMOJIS[type] ?? '⚙️';
  }

  operatorLabel(op: string): string {
    const map: Record<string, string> = {gt: '>', gte: '≥', lt: '<', lte: '≤', eq: '='};
    return map[op] ?? op;
  }

  actionLabel(action: string): string {
    return this._translation.translate(action === 'turn_on' ? 'greenhouse.turnOn' : 'greenhouse.turnOff');
  }

  deviceIcon(type: string, isOn: boolean): string {
    return isOn ? 'bulb.svg' : 'bulb-outline.svg';
  }

  // --- Desktop dashboard: alerts ---

  alertSeverity(alert: AlertDto): 'critical' | 'warning' {
    return alert.sensor_type === 'temperature' || alert.sensor_type === 'humidity' ? 'critical' : 'warning';
  }

  setAlertFilter(filter: 'all' | 'critical'): void {
    this.alertFilter.set(filter);
  }

  // --- Desktop dashboard: sensors ---

  sensorThreshold(sensor: SensorDto): { threshold: number; direction: 'over' | 'under' } {
    const rule = this.rules().find(r => r.trigger_sensor_id === sensor.id);
    if (rule) {
      return {
        threshold: Number(rule.threshold),
        direction: (rule.operator === 'gt' || rule.operator === 'gte') ? 'over' : 'under',
      };
    }
    return this.SENSOR_DEFAULTS[sensor.type] ?? {threshold: 0, direction: 'over'};
  }

  sensorValueDisplay(sensor: SensorDto): string {
    const value = this.sensorValues()[sensor.id];
    return value === undefined ? '—' : (Math.round(value * 10) / 10).toString();
  }

  sensorIsCritical(sensor: SensorDto): boolean {
    const value = this.sensorValues()[sensor.id];
    if (value === undefined) return false;
    const t = this.sensorThreshold(sensor);
    return t.direction === 'over' ? value > t.threshold : value < t.threshold;
  }

  sensorDeltaLabel(sensor: SensorDto): string {
    const value = this.sensorValues()[sensor.id];
    if (value === undefined) return '';
    const t = this.sensorThreshold(sensor);
    const diff = value - t.threshold;
    const sign = diff > 0 ? '+' : '';
    return this._translation.translate('greenhouse.vsThreshold', {
      diff: `${sign}${diff.toFixed(1)}${sensor.unit}`,
      value: `${t.threshold}${sensor.unit}`,
    });
  }

  sparklinePoints(sensorId: number): string {
    const values = this.sensorTrends()[sensorId] ?? [];
    if (values.length === 0) return '';
    const min = Math.min(...values), max = Math.max(...values);
    const range = max - min || 1;
    const w = 160, h = 36, step = w / (values.length - 1 || 1);
    return values.map((v, i) => `${(i * step).toFixed(1)},${(h - ((v - min) / range) * h).toFixed(1)}`).join(' ');
  }

  async setChartRange(range: ChartRange): Promise<void> {
    this.chartRange.set(range);
    await this._loadSensorTrends();
  }

  // --- Desktop dashboard: manual control ---

  deviceModeFor(device: DeviceDto): 'auto' | 'manual' {
    const overrides = this._deviceModeOverrides();
    if (device.id in overrides) return overrides[device.id];
    return this.rules().some(r => r.is_active && r.action_device_id === device.id) ? 'auto' : 'manual';
  }

  toggleDeviceMode(device: DeviceDto): void {
    const next = this.deviceModeFor(device) === 'auto' ? 'manual' : 'auto';
    this._deviceModeOverrides.update(m => ({...m, [device.id]: next}));
  }

  deviceRuntimeText(device: DeviceDto): string {
    if (!device.last_commanded_at) {
      return device.status ? this._translation.translate('greenhouse.running') : this._translation.translate('common.off');
    }
    const mins = Math.max(0, Math.floor((Date.now() - new Date(device.last_commanded_at).getTime()) / 60000));
    const h = Math.floor(mins / 60), m = mins % 60;
    const dur = h > 0 ? `${h}h ${m}m` : `${m}m`;
    return device.status
      ? this._translation.translate('greenhouse.runningFor', {duration: dur})
      : this._translation.translate('greenhouse.offIdle', {duration: dur});
  }

  // --- Desktop dashboard: misc ---

  timeAgo(dateStr: string): string {
    const mins = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000);
    if (mins < 1) return this._translation.translate('common.justNow');
    if (mins < 60) return this._translation.translate('common.minutesAgo', {count: mins});
    const hours = Math.floor(mins / 60);
    if (hours < 24) return this._translation.translate('common.hoursAgo', {count: hours});
    return this._translation.translate('common.daysAgo', {count: Math.floor(hours / 24)});
  }

  activeAlertsLabel(): string {
    const count = this.unreadCount();
    const key = count === 1 ? 'greenhouse.activeAlertOne' : 'greenhouse.activeAlertOther';
    return `${count} ${this._translation.translate(key)}`;
  }

  sensorsDevicesSummary(): string {
    const sensorCount = this.sensors().length;
    const deviceCount = this.devices().length;
    const sensorWord = this._translation.translate(sensorCount === 1 ? 'greenhouse.sensorOne' : 'greenhouse.sensorOther');
    const deviceWord = this._translation.translate(deviceCount === 1 ? 'greenhouse.deviceOne' : 'greenhouse.deviceOther');
    return `${sensorCount} ${sensorWord} · ${deviceCount} ${deviceWord}`;
  }

  private async _buildStats(sensors: SensorDto[]): Promise<void> {
    this._sensorMeta.clear();
    const withReadings = await Promise.all(
      sensors.map(async sensor => ({sensor, reading: await this._sensorService.getLatestReading(sensor.id)}))
    );
    this.stats.set(withReadings.map(({sensor, reading}, index) => {
      this._sensorMeta.set(sensor.id, {unit: sensor.unit, index});
      return {
        icon: 'bulb-outline.svg',
        title: sensor.name,
        value: reading ? `${Math.round(Number(reading.value))} ${sensor.unit}` : '—',
      };
    }));

    const values: Record<number, number> = {};
    let latestTs: string | null = null;
    for (const {sensor, reading} of withReadings) {
      if (!reading) continue;
      values[sensor.id] = Number(reading.value);
      if (!latestTs || new Date(reading.recorded_at) > new Date(latestTs)) latestTs = reading.recorded_at;
    }
    this.sensorValues.set(values);
    this.lastSyncedAt.set(latestTs);
  }

  private async _loadSensorTrends(): Promise<void> {
    const days = this.chartRange() === '24h' ? 1 : this.chartRange() === '7d' ? 7 : 30;
    const to = new Date();
    const from = new Date(to.getTime() - days * 24 * 60 * 60 * 1000);

    const entries = await Promise.all(
      this.sensors().map(async sensor => {
        const readings = await this._sensorService.getReadings(sensor.id, from, to);
        return [sensor.id, this._downsample(readings.map(r => Number(r.value)), 8)] as const;
      })
    );
    this.sensorTrends.set(Object.fromEntries(entries));
  }

  private _downsample(values: number[], points: number): number[] {
    if (values.length <= points) return values;
    const step = values.length / points;
    return Array.from({length: points}, (_, i) => values[Math.floor(i * step)]);
  }

  private async _loadSchedule(greenhouseId: number): Promise<void> {
    try {
      const response = await this._httpService.get<{ data: ApiTaskLike[] }>(`greenhouses/${greenhouseId}/tasks`);
      const entries = response.data
        .filter(t => t.type === 'system_command')
        .map(t => {
          const d = new Date(t.scheduled_at);
          const time = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
          const recurringRaw = t.payload?.['recurring'] as string | undefined;
          const recurring: ScheduleEntry['recurring'] =
            recurringRaw === 'daily' || recurringRaw === 'weekly' || recurringRaw === 'custom' ? recurringRaw : 'once';
          return {title: t.title, recurring, time};
        });
      this.scheduleEntries.set(entries);
    } catch {
      this.scheduleEntries.set([]);
    }
  }

  private _bindWsEvents(): void {
    this._subs.push(
      this._wsService.sensorReading$.subscribe(event => {
        const meta = this._sensorMeta.get(event.sensor_id);
        if (!meta) return;
        this.stats.update(list => {
          const updated = [...list];
          updated[meta.index] = {...updated[meta.index], value: `${Math.round(Number(event.value))} ${meta.unit}`};
          return updated;
        });
      }),
      this._wsService.deviceStatus$.subscribe(event => {
        this.devices.update(list => list.map(d => d.id === event.device_id ? {...d, status: event.status} : d));
      }),
      this._wsService.alertFired$.subscribe(async event => {
        const newAlert: AlertDto = {
          id: event.alert_id,
          greenhouse_id: event.greenhouse_id,
          sensor_id: 0,
          sensor_type: event.sensor_type,
          value: String(event.value),
          threshold: String(event.threshold),
          operator: 'gt',
          message: event.message,
          is_read: false,
          triggered_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
        };
        this.alerts.update(list => [newAlert, ...list]);
        await this._toastService.fireToast(this._translation.translate('greenhouse.alertToast', {type: event.sensor_type}));
      }),
    );
  }
}
