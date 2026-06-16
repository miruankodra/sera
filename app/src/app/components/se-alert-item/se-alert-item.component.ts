import {Component, input, output} from '@angular/core';
import {AlertDto} from '../../models/alert-dto';
import {AnimateOnClickDirective} from '../../directives/animateOnClick.directive';

@Component({
  selector: 'se-alert-item',
  standalone: true,
  imports: [AnimateOnClickDirective],
  templateUrl: './se-alert-item.component.html',
  styleUrl: './se-alert-item.component.scss',
})
export class SeAlertItemComponent {
  alert = input.required<AlertDto>();
  markRead = output<void>();

  sensorLabel(): string {
    const labels: Record<string, string> = {
      temperature: 'Temperature',
      humidity: 'Humidity',
      soil_moisture: 'Soil Moisture',
      light: 'Light',
    };
    return labels[this.alert().sensor_type] ?? this.alert().sensor_type;
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
    const ops: Record<string, string> = {
      gt: 'exceeded', gte: 'reached or exceeded',
      lt: 'dropped below', lte: 'reached or dropped below',
      eq: 'equalled',
    };
    return ops[this.alert().operator] ?? this.alert().operator;
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
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  }
}
