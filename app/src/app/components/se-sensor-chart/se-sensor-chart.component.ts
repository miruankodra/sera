import {
  Component, input, OnChanges, OnDestroy, AfterViewInit,
  ViewChild, ElementRef,
} from '@angular/core';
import {Chart, ChartConfiguration, registerables} from 'chart.js';
import {SensorReadingDto} from '../../models/sensor-dto';

Chart.register(...registerables);

@Component({
  selector: 'se-sensor-chart',
  standalone: true,
  imports: [],
  templateUrl: './se-sensor-chart.component.html',
  styleUrl: './se-sensor-chart.component.scss',
})
export class SeSensorChartComponent implements AfterViewInit, OnChanges, OnDestroy {
  @ViewChild('canvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  readings = input.required<SensorReadingDto[]>();
  unit = input<string>('');
  color = input<string>('#1A9E78');

  private _chart: Chart | null = null;
  private _initialized = false;

  ngAfterViewInit(): void {
    this._initialized = true;
    this._render();
  }

  ngOnChanges(): void {
    if (this._initialized) this._render();
  }

  ngOnDestroy(): void {
    this._chart?.destroy();
  }

  private _render(): void {
    const sorted = [...this.readings()].reverse();

    const labels = sorted.map(r =>
      new Date(r.recorded_at).toLocaleDateString('en-US', {month: 'short', day: 'numeric'})
    );
    const values = sorted.map(r => Number(r.value));

    if (this._chart) {
      this._chart.data.labels = labels;
      this._chart.data.datasets[0].data = values;
      this._chart.update('none');
      return;
    }

    const config: ChartConfiguration = {
      type: 'line',
      data: {
        labels,
        datasets: [{
          data: values,
          borderColor: this.color(),
          backgroundColor: this.color() + '18',
          borderWidth: 2,
          pointRadius: sorted.length > 50 ? 0 : 3,
          tension: 0.4,
          fill: true,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {legend: {display: false}},
        scales: {
          x: {
            ticks: {maxTicksLimit: 7, font: {size: 10}},
            grid: {display: false},
          },
          y: {
            ticks: {font: {size: 10}},
            grid: {color: '#f3f4f6'},
          },
        },
      },
    };

    this._chart = new Chart(this.canvasRef.nativeElement, config);
  }
}
