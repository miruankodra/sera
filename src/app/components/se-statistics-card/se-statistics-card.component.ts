import {Component, input, InputSignal} from '@angular/core';
import {SeCardComponent} from "../shared/se-card/se-card.component";
import {GhStatisticsDto} from "../../models/gh-statistics-dto";
import {SeStatItemComponent} from "../shared/se-stat-item/se-stat-item.component";

@Component({
  selector: 'se-statistics-card',
  standalone: true,
  imports: [
    SeCardComponent,
    SeStatItemComponent
  ],
  templateUrl: './se-statistics-card.component.html',
  styleUrl: './se-statistics-card.component.scss'
})
export class SeStatisticsCardComponent {
  statistics: InputSignal<GhStatisticsDto[]> = input.required<GhStatisticsDto[]>();
}
