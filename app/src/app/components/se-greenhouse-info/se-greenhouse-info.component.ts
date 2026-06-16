import {Component, inject, input, InputSignal} from '@angular/core';
import {SeTitleComponent} from "../shared/se-title/se-title.component";
import {SeLocationLabelComponent} from "../shared/se-location-label/se-location-label.component";
import {SeCardComponent} from "../shared/se-card/se-card.component";
import {ModalService} from "../../services/modal.service";
import {GreenhouseDto} from "../../models/greenhouse-dto";

@Component({
  selector: 'se-greenhouse-info',
  standalone: true,
  imports: [
    SeTitleComponent,
    SeLocationLabelComponent,
    SeCardComponent
  ],
  templateUrl: './se-greenhouse-info.component.html',
  styleUrl: './se-greenhouse-info.component.scss'
})
export class SeGreenhouseInfoComponent {
  greenhouse: InputSignal<GreenhouseDto> = input.required<GreenhouseDto>();

  _modalService = inject(ModalService)

  back() {
    this._modalService.close();
  }
}
