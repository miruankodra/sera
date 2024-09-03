import {Component, Input, input, output, OutputEmitterRef} from '@angular/core';
import {SelectOptionsDto} from "../../../models/select-options-dto";
import {SeTitleComponent} from "../se-title/se-title.component";

@Component({
  selector: 'se-select',
  standalone: true,
  imports: [
    SeTitleComponent
  ],
  templateUrl: './se-select.component.html',
  styleUrl: './se-select.component.scss'
})
export class SeSelectComponent {
  background = input<string>('bg-white');
  border = input<string>('border-none');
  title = input<string>('Select');
  titleColor = input<string>('text-black')
  optionColor = input<string>('text-white')

  // options = input.required<SelectOptionsDto[]>();

  @Input() options: SelectOptionsDto[] = [];

  onSelect: OutputEmitterRef<string> = output<string>();

  isToggled: boolean = false;


  toggleSelect(): void {
    this.isToggled = !this.isToggled;
  }

  selectOption(option: string): void {
    this.onSelect.emit(option);
    this.isToggled = false;
  }

}
