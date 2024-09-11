import {Component, output, OutputEmitterRef} from '@angular/core';

@Component({
  selector: 'se-back-button',
  standalone: true,
  imports: [],
  templateUrl: './se-back-button.component.html',
  styleUrl: './se-back-button.component.scss'
})
export class SeBackButtonComponent {
  onClick: OutputEmitterRef<void> = output();

  buttonClicked(): void {
    this.onClick.emit();
  }
}
