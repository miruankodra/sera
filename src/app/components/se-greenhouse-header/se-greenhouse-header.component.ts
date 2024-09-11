import {Component, inject, input} from '@angular/core';
import {SeBackButtonComponent} from "../shared/se-back-button/se-back-button.component";
import {SeEllipsisMenuComponent} from "../shared/se-ellipsis-menu/se-ellipsis-menu.component";
import {ModalService} from "../../services/modal.service";

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
  showBackButton = input<boolean>(true);
  showMenuButton = input<boolean>(true);
  // styles = input<string>();

  private _modalService: ModalService = inject(ModalService);

  goBack() {
    this._modalService.close();
  }

}
