import {Component, inject, input} from '@angular/core';
import {SeBadgeComponent} from "../shared/se-badge/se-badge.component";
import {SeTitleComponent} from "../shared/se-title/se-title.component";
import {SeLocationLabelComponent} from "../shared/se-location-label/se-location-label.component";
import {SeCardComponent} from "../shared/se-card/se-card.component";
import {ModalService} from "../../services/modal.service";

@Component({
  selector: 'se-greenhouse-info',
  standalone: true,
  imports: [
    SeBadgeComponent,
    SeTitleComponent,
    SeLocationLabelComponent,
    SeCardComponent
  ],
  templateUrl: './se-greenhouse-info.component.html',
  styleUrl: './se-greenhouse-info.component.scss'
})
export class SeGreenhouseInfoComponent {
  name = input<string>('The Greenhouse I');
  location = input<string>('Tirane, Albania');
  plants = input<number>(0);
  cover = input<string>('assets/images/defaults/greenhouse-cover.jpg');

  _modalService = inject(ModalService)

  back() {
    this._modalService.close();
  }
}
