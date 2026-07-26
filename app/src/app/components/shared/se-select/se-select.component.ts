import {Component, Input, input, output, OutputEmitterRef} from '@angular/core';
import {SelectOptionsDto} from "../../../models/select-options-dto";
import {SeTitleComponent} from "../se-title/se-title.component";
import {SeItemComponent} from "../se-item/se-item.component";

@Component({
  selector: 'se-select',
  standalone: true,
  imports: [
    SeTitleComponent,
    SeItemComponent
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
  linesColor = input<string>('border-white')

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
