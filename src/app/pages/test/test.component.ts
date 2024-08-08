import {Component} from '@angular/core';
import {SeTitleComponent} from "../../components/shared/se-title/se-title.component";
import {SeInputComponent} from "../../components/shared/se-input/se-input.component";
import {SeButtonComponent} from "../../components/shared/se-button/se-button.component";
import {SeSwitchComponent} from "../../components/shared/se-switch/se-switch.component";

@Component({
  selector: 'se-test',
  standalone: true,
  imports: [
    SeTitleComponent,
    SeInputComponent,
    SeButtonComponent,
    SeSwitchComponent
  ],
  templateUrl: './test.component.html',
  styleUrl: './test.component.scss'
})
export class TestComponent {

  getInputValue(e: string): void {
    console.log('Input value:', e);
  }

  buttonClicked(): void {
    console.log('Button clicked!');
  }

  switchToggled(e: boolean): void {
    console.log('Switch Toggled: ' + e);
  }
}
