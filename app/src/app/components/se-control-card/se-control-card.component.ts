import {Component, effect, input, output, signal} from '@angular/core';
import {SeCardComponent} from "../shared/se-card/se-card.component";
import {SeSwitchComponent} from "../shared/se-switch/se-switch.component";
import {SeTitleComponent} from "../shared/se-title/se-title.component";

@Component({
  selector: 'se-control-card',
  standalone: true,
  imports: [SeCardComponent, SeSwitchComponent, SeTitleComponent],
  templateUrl: './se-control-card.component.html',
  styleUrl: './se-control-card.component.scss'
})
export class SeControlCardComponent {
  title = input<string>('Title');
  subtitle = input<string>('Subtitle');
  onIcon = input<string>('');
  offIcon = input<string>('');
  initState = input<boolean>(false);

  onToggle = output<boolean>();

  isToggled = signal(false);

  constructor() {
    effect(() => {
      this.isToggled.set(this.initState());
    });
  }

  toggleSwitch(newState: boolean): void {
    this.isToggled.set(newState);
    this.onToggle.emit(newState);
  }
}
