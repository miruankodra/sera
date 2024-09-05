import {Component, input} from '@angular/core';
import {SeTitleComponent} from "../se-title/se-title.component";

@Component({
  selector: 'se-stat-item',
  standalone: true,
  imports: [
    SeTitleComponent
  ],
  templateUrl: './se-stat-item.component.html',
  styleUrl: './se-stat-item.component.scss'
})
export class SeStatItemComponent {
  image = input('bulb.svg');
  title = input<string>('Title');
  value = input<string>('value');
}
