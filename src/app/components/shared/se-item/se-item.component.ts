import {Component, input} from '@angular/core';
import { AnimateOnClickDirective } from '../../../directives/animateOnClick.directive';

@Component({
  selector: 'se-item',
  standalone: true,
  imports: [AnimateOnClickDirective],
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
