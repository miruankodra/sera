import {Component, inject} from '@angular/core';
import {SeWelcomeHeaderComponent} from "../../components/se-welcome-header/se-welcome-header.component";
import {SeDateComponent} from "../../components/se-date/se-date.component";
import {SeGreenhouseCardComponent} from "../../components/se-greenhouse-card/se-greenhouse-card.component";
import {GreenhouseDto} from "../../models/greenhouse-dto";
import {ToastService} from "../../services/toast.service";
import {ModalService} from "../../services/modal.service";
import {SeGreenhouseInfoComponent} from "../../components/se-greenhouse-info/se-greenhouse-info.component";

@Component({
  selector: 'se-home',
  standalone: true,
  imports: [
    SeWelcomeHeaderComponent,
    SeDateComponent,
    SeGreenhouseCardComponent
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {

  private _toastService = inject(ToastService);
  private _modalService = inject(ModalService);
  greenhouseCards: GreenhouseDto[] = [
    {
      id: 0,
      cover: 'greenhouse-cover.jpg',
      name: 'The Greenhouse I',
      location: 'Tirane, Albania',
      plants: 10
    },
    {
      id: 1,
      cover: 'greenhouse-cover.jpg',
      name: 'The Greenhouse I',
      location: 'Tirane, Albania',
      plants: 20
    },
    {
      id: 2,
      cover: 'greenhouse-cover.jpg',
      name: 'The Greenhouse I',
      location: 'Tirane, Albania',
      plants: 30
    },
    {
      id: 3,
      cover: 'greenhouse-cover.jpg',
      name: 'The Greenhouse I',
      location: 'Tirane, Albania',
      plants: 40
    },
    {
      id: 4,
      cover: 'greenhouse-cover.jpg',
      name: 'The Greenhouse I',
      location: 'Tirane, Albania',
      plants: 50
    }
  ];


  goToGreenhouse(greenhouse: GreenhouseDto): void {
    this._toastService.fireToast(`Greenhouse with id: ${greenhouse.id} clicked!`)
    this._modalService.show(SeGreenhouseInfoComponent);
  }
}
