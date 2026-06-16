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
import {Subscription} from 'rxjs';

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

  readonly sensorMap = computed(() => new Map(this.sensors().map(s => [s.id, s])));
  readonly deviceMap = computed(() => new Map(this.devices().map(d => [d.id, d])));

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
    await this._buildStats(sensors);
    this.loading.set(false);

    await this._wsService.subscribe(id);
    this._bindWsEvents();
  }

  ngOnDestroy(): void {
    this._wsService.unsubscribe(this.greenhouse().id);
    this._subs.forEach(s => s.unsubscribe());
  }

  // ── Device control ──────────────────────────────────────────────────────────

  async sendCommand(device: DeviceDto, isOn: boolean): Promise<void> {
    this.devices.update(list => list.map(d => d.id === device.id ? {...d, status: isOn} : d));
    try {
      const updated = await this._deviceService.sendCommand(device.id, isOn ? 'turn_on' : 'turn_off');
      this.devices.update(list => list.map(d => d.id === updated.id ? updated : d));
    } catch {
      this.devices.update(list => list.map(d => d.id === device.id ? {...d, status: !isOn} : d));
      await this._toastService.fireToast('Command could not be sent. Please try again.');
    }
  }

  // ── Alerts ──────────────────────────────────────────────────────────────────

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

  // ── Automation rules ─────────────────────────────────────────────────────────

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
      await this._toastService.fireToast('Could not create rule. Please try again.');
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

  // ── Display helpers ──────────────────────────────────────────────────────────

  sensorEmoji(type: string): string {
    return SENSOR_EMOJIS[type] ?? '📊';
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
    return action === 'turn_on' ? 'Turn On' : 'Turn Off';
  }

  deviceIcon(type: string, isOn: boolean): string {
    return isOn ? 'bulb.svg' : 'bulb-outline.svg';
  }

  // ── Private ──────────────────────────────────────────────────────────────────

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
        await this._toastService.fireToast(`⚠️ Alert: ${event.sensor_type} threshold breached`);
      }),
    );
  }
}
