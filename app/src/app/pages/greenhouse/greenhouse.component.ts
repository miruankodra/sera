import {Component} from '@angular/core';
import {SeGreenhouseHeaderComponent} from "../../components/se-greenhouse-header/se-greenhouse-header.component";
import {SeGreenhouseInfoComponent} from "../../components/se-greenhouse-info/se-greenhouse-info.component";
import {NgClass} from "@angular/common";
import {SeStatisticsCardComponent} from "../../components/se-statistics-card/se-statistics-card.component";
import {GhStatisticsDto} from "../../models/gh-statistics-dto";
import { SeTabPanelComponent } from '../../components/se-tab-panel/se-tab-panel.component';
import { SePanelTabComponent } from "../../components/se-panel-tab/se-panel-tab.component";
import { SeControlCardComponent } from "../../components/se-control-card/se-control-card.component";

@Component({
  selector: 'se-greenhouse',
  standalone: true,
  imports: [
    SeGreenhouseHeaderComponent,
    SeGreenhouseInfoComponent,
    NgClass,
    SeStatisticsCardComponent,
    SeTabPanelComponent,
    SePanelTabComponent,
    SeControlCardComponent
],
  templateUrl: './greenhouse.component.html',
  styleUrl: './greenhouse.component.scss'
})
export class GreenhouseComponent {
  stats: GhStatisticsDto[] = [
    {icon: 'bulb-outline.svg', title: 'Lighting', value: '13 Watt'},
    {icon: 'bulb-outline.svg', title: 'Wind', value: '5 m/s'},
    {icon: 'bulb-outline.svg', title: 'Humidity', value: '30%'},
  ];
}
