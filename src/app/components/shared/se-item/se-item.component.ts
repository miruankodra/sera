import {Component, input} from '@angular/core';

@Component({
  selector: 'se-item',
  standalone: true,
  imports: [],
  templateUrl: './se-item.component.html',
  styleUrl: './se-item.component.scss'
})
export class SeItemComponent {
  width = input<string>('w-full');
  height = input<string>('');
  line = input<boolean>(true);
  lineColor = input<string>('border-se-jungle');
  align = input<string>('items-center');
  justify = input<string>('justify-start')
}
