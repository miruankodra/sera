import {Component, input, output, OutputEmitterRef} from '@angular/core';
import { SeButtonComponent } from "../se-button/se-button.component";
import { Item } from '../../../models/core/item';
import { SeCardComponent } from "../se-card/se-card.component";
import { SeItemComponent } from '../se-item/se-item.component';

@Component({
  selector: 'se-ellipsis-menu',
  standalone: true,
  imports: [SeButtonComponent, SeCardComponent, SeItemComponent],
  templateUrl: './se-ellipsis-menu.component.html',
  styleUrl: './se-ellipsis-menu.component.scss'
})
export class SeEllipsisMenuComponent {
  menuItems = input.required<Item[]>();
  isToggled = false;
  

  onMenuItemClick: OutputEmitterRef<string> = output<string>();

  toggleMenu(): void {
    this.isToggled =!this.isToggled;
  }

  menuItemClicked(menuId: string) {
    this.onMenuItemClick.emit(menuId);
  }
}
