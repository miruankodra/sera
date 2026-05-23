import {Component, ElementRef, inject, ViewChild} from '@angular/core';
import {SeWelcomeHeaderComponent} from "../../components/se-welcome-header/se-welcome-header.component";
import {SeDateComponent} from "../../components/se-date/se-date.component";
import {SeGreenhouseCardComponent} from "../../components/se-greenhouse-card/se-greenhouse-card.component";
import {GreenhouseDto} from "../../models/greenhouse-dto";
import {ModalService} from "../../services/modal.service";

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

  @ViewChild('header') header!: ElementRef;

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

  fadeIOHeader(event: any): void {
    const el = event.target;
    const scrollTop = el.scrollTop;
    const fadeHeight = 100;
    const opacity = Math.max(0, 1 - scrollTop / fadeHeight);
    this.header.nativeElement.style.opacity = opacity.toString();
    this.header.nativeElement.style.transform = `translateY(-${scrollTop}px)`;
  }
}
