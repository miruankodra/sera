import {Component, input, output, OutputEmitterRef} from '@angular/core';

@Component({
  selector: 'se-input',
  standalone: true,
  imports: [],
  templateUrl: './se-input.component.html',
  styleUrl: './se-input.component.scss'
})
export class SeInputComponent {
  type = input<string>('text');
  width = input<string>('w-full');
  height = input<string>('h-[54px]');
  bgColor = input<string>('bg-white opacity-10 backdrop-blur-2xl');
  borderColor = input<string>('border-black');
  fontStyle = input<string>('text-[24px] text-white font-medium');
  icon = input<string>();
  placeholder = input<string>('');

  onInput: OutputEmitterRef<string> = output<string>();

  onInputChange(event: Event): void {
    const inputValue = (event.target as HTMLInputElement).value;
    this.onInput.emit(inputValue);
  }

}
