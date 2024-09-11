import {Component} from '@angular/core';
import {SeTitleComponent} from "../../components/shared/se-title/se-title.component";
import {SeInputComponent} from "../../components/shared/se-input/se-input.component";
import {SeButtonComponent} from "../../components/shared/se-button/se-button.component";
import {SeSwitchComponent} from "../../components/shared/se-switch/se-switch.component";
import {SeBadgeComponent} from "../../components/shared/se-badge/se-badge.component";
import {SeAccordionComponent} from "../../components/shared/se-accordion/se-accordion.component";
import {SeItemComponent} from "../../components/shared/se-item/se-item.component";
import {SeCardComponent} from "../../components/shared/se-card/se-card.component";
import {SeSelectComponent} from "../../components/shared/se-select/se-select.component";
import {SelectOptionsDto} from "../../models/select-options-dto";
import {SeControlCardComponent} from "../../components/se-control-card/se-control-card.component";
import {SeGreenhouseCardComponent} from "../../components/se-greenhouse-card/se-greenhouse-card.component";
import {SeStatItemComponent} from "../../components/shared/se-stat-item/se-stat-item.component";
import {SeStatisticsCardComponent} from "../../components/se-statistics-card/se-statistics-card.component";
import {GhStatisticsDto} from "../../models/gh-statistics-dto";


@Component({
  selector: 'se-test',
  standalone: true,
  imports: [
    SeTitleComponent,
    SeInputComponent,
    SeButtonComponent,
    SeSwitchComponent,
    SeBadgeComponent,
    SeAccordionComponent,
    SeItemComponent,
    SeCardComponent,
    SeSelectComponent,
    SeControlCardComponent,
    SeGreenhouseCardComponent,
    SeStatItemComponent,
    SeStatisticsCardComponent
  ],
  templateUrl: './test.component.html',
  styleUrl: './test.component.scss'
})
export class TestComponent {

  selectOptions: SelectOptionsDto[] = [
    {value: 'Option 1', key: 'Option 1'},
    {value: 'Option 2', key: 'Option 2'},
    {value: 'Option 3', key: 'Option 3'},
    {value: 'Option 3', key: 'Option 3'},
    {value: 'Option 3', key: 'Option 3'},
    {value: 'Option 3', key: 'Option 3'},
    {value: 'Option 3', key: 'Option 3'},
  ];

  stats: GhStatisticsDto[] = [
    {icon: 'bulb-outline.svg', title: 'Lighting', value: '13 Watt'},
    {icon: 'bulb-outline.svg', title: 'Wind', value: '5 m/s'},
    {icon: 'bulb-outline.svg', title: 'Humidity', value: '30%'},
  ];

  getInputValue(e: string): void {
    console.log('Input value:', e);
  }

  buttonClicked(): void {
    console.log('Button clicked!');
  }

  switchToggled(e: boolean): void {
    console.log('Switch Toggled: ' + e);
  }

  selectOption(value: string): void {
    console.log('Select option: ' + value);
  }

  controlCardToggled(e: boolean): void {
    console.log('Control Card Toggled: ' + e);
  }
}
