import {Component, effect, input, output, signal} from '@angular/core';
import {SeTitleComponent} from "../se-title/se-title.component";

@Component({
  selector: 'se-switch',
  standalone: true,
  imports: [SeTitleComponent],
  templateUrl: './se-switch.component.html',
  styleUrl: './se-switch.component.scss'
})
export class SeSwitchComponent {
  label = input<string>();
  labelColor = input<string>('text-white');
  labelSize = input<string>('text-[20px]');
  labelWeight = input<string>('font-semibold');
  initState = input<boolean>(false);

  onToggle = output<boolean>();

  isChecked = signal(false);

  constructor() {
    effect(() => {
      this.isChecked.set(this.initState());
    });
  }

  toggleSwitch(): void {
    this.isChecked.update(v => !v);
    this.onToggle.emit(this.isChecked());
  }
}
