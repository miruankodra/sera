import {Component, input} from '@angular/core';

@Component({
  selector: 'se-badge',
  standalone: true,
  imports: [],
  templateUrl: './se-badge.component.html',
  styleUrl: './se-badge.component.scss'
})
export class SeBadgeComponent {
  background = input('bg-white bg-opacity-50');
  border = input('border-none');
  text = input('text-se-green text-[16px] font-medium');
}
