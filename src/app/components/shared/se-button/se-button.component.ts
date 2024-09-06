import {Component, input, output, OutputEmitterRef} from '@angular/core';

@Component({
  selector: 'se-button',
  standalone: true,
  imports: [],
  templateUrl: './se-button.component.html',
  styleUrl: './se-button.component.scss'
})
export class SeButtonComponent {
  height = input<string>('h-[54px]');
  width = input<string>('w-full');
  background = input<string>('bg-se-jungle');
  border = input<string>('border-none');
  radius = input<string>('rounded-full')
  text = input<string>('text-[18px] text-white font-semibold');

  onClick: OutputEmitterRef<void> = output<void>();

  onButtonClick(): void {
    this.onClick.emit();
  }

}
