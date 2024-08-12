import {Component, input} from '@angular/core';

@Component({
  selector: 'se-card',
  standalone: true,
  imports: [],
  templateUrl: './se-card.component.html',
  styleUrl: './se-card.component.scss'
})
export class SeCardComponent {
  width = input('w-28');
  height = input('h-28');
  bgColor = input('bg-se-green');
  border = input('border-none')
}
