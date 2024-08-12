import {Component, input} from '@angular/core';
import {SeTitleComponent} from "../se-title/se-title.component";

@Component({
  selector: 'se-accordion',
  standalone: true,
  imports: [
    SeTitleComponent
  ],
  templateUrl: './se-accordion.component.html',
  styleUrl: './se-accordion.component.scss'
})
export class SeAccordionComponent {
  background = input('bg-white');
  border = input('border-none');
  chevronColor = input('white');

  isToggled: boolean = false;

  toggleAccordion(): void {
    this.isToggled = !this.isToggled;
  }
}
