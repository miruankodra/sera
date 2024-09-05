import {Component} from '@angular/core';
import {SeBackButtonComponent} from "../shared/se-back-button/se-back-button.component";
import {SeEllipsisMenuComponent} from "../shared/se-ellipsis-menu/se-ellipsis-menu.component";

@Component({
  selector: 'se-greenhouse-header',
  standalone: true,
  imports: [
    SeBackButtonComponent,
    SeEllipsisMenuComponent
  ],
  templateUrl: './se-greenhouse-header.component.html',
  styleUrl: './se-greenhouse-header.component.scss'
})
export class SeGreenhouseHeaderComponent {

}
