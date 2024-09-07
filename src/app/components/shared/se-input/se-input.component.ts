import {Component, forwardRef, input, output, OutputEmitterRef} from '@angular/core';
import {NG_VALUE_ACCESSOR} from "@angular/forms";

@Component({
  selector: 'se-input',
  standalone: true,
  imports: [],
  templateUrl: './se-input.component.html',
  styleUrl: './se-input.component.scss',
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => SeInputComponent),
    multi: true
  }]
})
export class SeInputComponent {
  type = input<string>('text');
  width = input<string>('w-full');
  height = input<string>('h-[54px]');
  bgColor = input<string>('bg-white opacity-10 backdrop-blur-2xl');
  border = input<string>('border-black');
  radius = input<string>('rounded-full')
  fontStyle = input<string>('text-[24px] text-white font-medium');
  icon = input<string>();
  placeholder = input<string>('');

  isPasswordVisible: boolean = false;

  onInput: OutputEmitterRef<string> = output<string>();

  value: string = ''
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onChange = (value: string) => {
  }
  onTouched = () => {
  }

  writeValue(value: string): void {
    this.value = value;
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  // setDisabledState?(isDisabled: boolean): void {}

  onInputChange(event: Event): void {
    const inputValue = (event.target as HTMLInputElement).value;
    this.onInput.emit(inputValue);
    this.value = inputValue;
    this.onChange(inputValue);
    this.onTouched();
  }

  togglePasswordVisibility(input: HTMLInputElement): void {
    this.isPasswordVisible = !this.isPasswordVisible;
    if (this.isPasswordVisible) {
      input.type = 'text';
    } else {
      input.type = 'password';
    }
  }

}
