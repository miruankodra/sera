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
import {SeBackButtonComponent} from "../../components/shared/se-back-button/se-back-button.component";
import {SeEllipsisMenuComponent} from "../../components/shared/se-ellipsis-menu/se-ellipsis-menu.component";
import {SeGreenhouseHeaderComponent} from "../../components/se-greenhouse-header/se-greenhouse-header.component";
import {SeGreenhouseInfoComponent} from "../../components/se-greenhouse-info/se-greenhouse-info.component";


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
    SeBackButtonComponent,
    SeEllipsisMenuComponent,
    SeGreenhouseHeaderComponent,
    SeGreenhouseInfoComponent
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
