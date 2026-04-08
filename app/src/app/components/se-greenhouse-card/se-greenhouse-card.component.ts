import {Component, input} from '@angular/core';
import {SeTitleComponent} from "../shared/se-title/se-title.component";
import {SeBadgeComponent} from "../shared/se-badge/se-badge.component";
import {SeLocationLabelComponent} from "../shared/se-location-label/se-location-label.component";
import {GreenhouseDto} from "../../models/greenhouse-dto";
import { AnimateOnClickDirective } from '../../directives/animateOnClick.directive';

@Component({
  selector: 'se-greenhouse-card',
  standalone: true,
  imports: [
    SeTitleComponent,
    SeBadgeComponent,
    SeLocationLabelComponent,
    AnimateOnClickDirective
  ],
  templateUrl: './se-greenhouse-card.component.html',
  styleUrl: './se-greenhouse-card.component.scss'
})
export class SeGreenhouseCardComponent {

  greenhouseInfo = input.required<GreenhouseDto>();

  goToGreenhouse(ghid: number): void {
    console.log('Open Greenhouse with id: ' + ghid);
  }
}
