import {Component, input} from '@angular/core';

@Component({
  selector: 'se-badge',
  standalone: true,
  imports: [],
  templateUrl: './se-badge.component.html',
  styleUrl: './se-badge.component.scss'
})
export class SeBadgeComponent {
  background = input('bg-se-jungle bg-opacity-10');
  border = input('border-none');
  text = input('text-se-jungle text-[16px] font-semibold');
}
