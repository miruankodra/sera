import {Component, input, output} from '@angular/core';
import {LucideAngularModule, Bell, Zap} from 'lucide-angular';
import {GreenhouseTask} from '../../../models/greenhouse-task';
import {TranslatePipe} from '../../../pipes/translate.pipe';

@Component({
  selector: 'se-today-strip',
  standalone: true,
  imports: [LucideAngularModule, TranslatePipe],
  templateUrl: './se-today-strip.component.html',
  styleUrl: './se-today-strip.component.scss',
})
export class SeTodayStripComponent {
  readonly BellIcon = Bell;
  readonly ZapIcon = Zap;

  tasks = input.required<GreenhouseTask[]>();
  taskSelected = output<string>();
}
