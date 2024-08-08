import {Component} from '@angular/core';
import {SeTitleComponent} from "../../components/shared/se-title/se-title.component";
import {SeInputComponent} from "../../components/shared/se-input/se-input.component";

@Component({
  selector: 'se-test',
  standalone: true,
  imports: [
    SeTitleComponent,
    SeInputComponent
  ],
  templateUrl: './test.component.html',
  styleUrl: './test.component.scss'
})
export class TestComponent {
  getInputValue(e: string) {
    console.log('Input value:', e);
  }
}
