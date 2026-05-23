import {Component, output, OutputEmitterRef} from '@angular/core';
import { SeButtonComponent } from "../se-button/se-button.component";

@Component({
  selector: 'se-back-button',
  standalone: true,
  imports: [SeButtonComponent],
  templateUrl: './se-back-button.component.html',
  styleUrl: './se-back-button.component.scss'
})
export class SeBackButtonComponent {
  onClick: OutputEmitterRef<void> = output();

  buttonClicked(): void {
    this.onClick.emit();
  }
}
