import {Component, input, output, OutputEmitterRef} from '@angular/core';
import {SeTitleComponent} from "../se-title/se-title.component";

@Component({
  selector: 'se-switch',
  standalone: true,
  imports: [
    SeTitleComponent
  ],
  templateUrl: './se-switch.component.html',
  styleUrl: './se-switch.component.scss'
})
export class SeSwitchComponent {
  label = input<string>();
  labelColor = input<string>('text-white');
  labelSize = input<string>('text-[20px]');
  labelWeight = input<string>('font-semibold');

  onToggle: OutputEmitterRef<boolean> = output<boolean>();

  toggleSwitch(checkbox: HTMLInputElement) {
    checkbox.checked = !checkbox.checked;
    this.onToggle.emit(checkbox.checked);
  }
}
