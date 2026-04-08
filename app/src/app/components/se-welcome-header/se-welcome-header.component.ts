import {Component, input} from '@angular/core';
import {SeTitleComponent} from "../shared/se-title/se-title.component";

@Component({
  selector: 'se-welcome-header',
  standalone: true,
  imports: [
    SeTitleComponent
  ],
  templateUrl: './se-welcome-header.component.html',
  styleUrl: './se-welcome-header.component.scss'
})
export class SeWelcomeHeaderComponent {
  username = input<string>('Fermer');
}
