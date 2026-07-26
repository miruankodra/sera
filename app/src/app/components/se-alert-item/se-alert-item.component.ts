import {Component, inject, input, output} from '@angular/core';
import {AlertDto} from '../../models/alert-dto';
import {AnimateOnClickDirective} from '../../directives/animateOnClick.directive';
import {TranslationService} from '../../services/translation.service';
import {TranslatePipe} from '../../pipes/translate.pipe';

@Component({
  selector: 'se-alert-item',
  standalone: true,
  imports: [AnimateOnClickDirective, TranslatePipe],
  templateUrl: './se-alert-item.component.html',
  styleUrl: './se-alert-item.component.scss',
})
export class SeAlertItemComponent {
  private _translation = inject(TranslationService);

  alert = input.required<AlertDto>();
  markRead = output<void>();

  sensorLabel(): string {
    return this._translation.translate(`sensorTypes.${this.alert().sensor_type}`);
  }

  sensorUnit(): string {
    const units: Record<string, string> = {
      temperature: '°C',
      humidity: '%',
      soil_moisture: '%',
      light: 'lux',
    };
    return units[this.alert().sensor_type] ?? '';
  }

  sensorEmoji(): string {
    const icons: Record<string, string> = {
      temperature: '🌡️',
      humidity: '💧',
      soil_moisture: '🌱',
      light: '☀️',
    };
    return icons[this.alert().sensor_type] ?? '⚠️';
  }

  operatorLabel(): string {
    return this._translation.translate(`alertVerbs.${this.alert().operator}`);
  }

  formattedValue(): string {
    return `${Math.round(parseFloat(this.alert().value))} ${this.sensorUnit()}`;
  }

  formattedThreshold(): string {
    return `${Math.round(parseFloat(this.alert().threshold))} ${this.sensorUnit()}`;
  }

  timeAgo(): string {
    const diff = Date.now() - new Date(this.alert().triggered_at).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return this._translation.translate('common.justNow');
    if (mins < 60) return this._translation.translate('common.minutesAgo', {count: mins});
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return this._translation.translate('common.hoursAgo', {count: hrs});
    return this._translation.translate('common.daysAgo', {count: Math.floor(hrs / 24)});
  }
}
