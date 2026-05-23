import { Component, input } from '@angular/core';

@Component({
  selector: 'se-panel-tab',
  standalone: true,
  imports: [],
  templateUrl: './se-panel-tab.component.html',
  styleUrl: './se-panel-tab.component.scss',
})
export class SePanelTabComponent {
  title = input<string>('Tab');
  active = false;

}
