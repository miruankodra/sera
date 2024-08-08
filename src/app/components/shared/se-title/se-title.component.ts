import {Component, input} from '@angular/core';

@Component({
  selector: 'se-title',
  standalone: true,
  imports: [],
  templateUrl: './se-title.component.html',
  styleUrl: './se-title.component.scss'
})
export class SeTitleComponent {
  color = input<string>('text-se-green')
  size = input<string>('text-2xl')
  weight = input<string>('font-semibold')
  font = input<string>('')
}
