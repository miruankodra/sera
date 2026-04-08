import {Component, input, output, OutputEmitterRef} from '@angular/core';
import { AnimateOnClickDirective } from '../../../directives/animateOnClick.directive';

@Component({
  selector: 'se-button',
  standalone: true,
  imports: [
    AnimateOnClickDirective
  ],
  templateUrl: './se-button.component.html',
  styleUrl: './se-button.component.scss'
})
export class SeButtonComponent {
  height = input<string>('h-[54px]');
  width = input<string>('w-full');
  background = input<string>('bg-se-jungle');
  border = input<string>('border-none');
  radius = input<string>('rounded-full');
  padding = input<string>('');
  margin = input<string>('');
  text = input<string>('text-[18px] text-white font-semibold');
  container = input<string>('flex items-center justify-center');
  clickAnimation = input<string>('');

  onClick: OutputEmitterRef<void> = output<void>();

  onButtonClick(): void {
    this.onClick.emit();
  }

}
