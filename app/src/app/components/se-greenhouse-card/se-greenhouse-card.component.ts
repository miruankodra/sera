import {Component, inject, input} from '@angular/core';
import {SeTitleComponent} from "../shared/se-title/se-title.component";
import {SeLocationLabelComponent} from "../shared/se-location-label/se-location-label.component";
import {GreenhouseDto} from "../../models/greenhouse-dto";
import { AnimateOnClickDirective } from '../../directives/animateOnClick.directive';
import {ModalService} from "../../services/modal.service";
import {GreenhouseComponent} from "../../pages/greenhouse/greenhouse.component";
import {TranslatePipe} from "../../pipes/translate.pipe";

@Component({
  selector: 'se-greenhouse-card',
  standalone: true,
  imports: [
    SeTitleComponent,
    SeLocationLabelComponent,
    AnimateOnClickDirective,
    TranslatePipe,
  ],
  templateUrl: './se-greenhouse-card.component.html',
  styleUrl: './se-greenhouse-card.component.scss'
})
export class SeGreenhouseCardComponent {

  greenhouseInfo = input.required<GreenhouseDto>();
  private _modalService = inject(ModalService);

  goToGreenhouse(): void {
    this._modalService.show(GreenhouseComponent, { greenhouse: this.greenhouseInfo });
  }
}
