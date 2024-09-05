import {Component, input} from '@angular/core';
import {SeTitleComponent} from "../shared/se-title/se-title.component";
import {SeBadgeComponent} from "../shared/se-badge/se-badge.component";
import {SeLocationLabelComponent} from "../shared/se-location-label/se-location-label.component";

@Component({
  selector: 'se-greenhouse-card',
  standalone: true,
  imports: [
    SeTitleComponent,
    SeBadgeComponent,
    SeLocationLabelComponent
  ],
  templateUrl: './se-greenhouse-card.component.html',
  styleUrl: './se-greenhouse-card.component.scss'
})
export class SeGreenhouseCardComponent {
  image = input<string>('greenhouse-cover.jpg');
  name = input<string>('The Greenhouse I');
  location = input<string>('Tirane, Albania');
  plants = input<number>(0)

  goToGreenhouse(ghid: number): void {
    console.log('Open Greenhouse: ' + this.name() + ' whith id: ' + ghid);
  }
}
