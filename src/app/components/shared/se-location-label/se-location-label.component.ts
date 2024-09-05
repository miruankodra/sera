import {Component, input} from '@angular/core';
import {SeTitleComponent} from "../se-title/se-title.component";

@Component({
  selector: 'se-location-label',
  standalone: true,
  imports: [
    SeTitleComponent
  ],
  templateUrl: './se-location-label.component.html',
  styleUrl: './se-location-label.component.scss'
})
export class SeLocationLabelComponent {
  location = input<string>('Location');
}
