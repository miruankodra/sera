import {Component, OnInit} from '@angular/core';
import {SeTitleComponent} from "../shared/se-title/se-title.component";

@Component({
  selector: 'se-date',
  standalone: true,
  imports: [
    SeTitleComponent
  ],
  templateUrl: './se-date.component.html',
  styleUrl: './se-date.component.scss'
})
export class SeDateComponent implements OnInit {
  date = new Date();
  months = ['Janar', 'Shkurt', 'Mars', 'Prill', 'Maj', 'Qershor', 'Korrik', 'Gusht', 'Shtator', 'Tetor', 'Nëntor', 'Dhjetor'];
  days = ['E Dielë', 'E Hënë', 'E Martë', 'E Mërkurë', 'E Enjte', 'E Premte', 'E Shtunë'];
  currentDate: string = '';

  ngOnInit(): void {
    this.currentDate = `${this.days[this.date.getDay()]}, ${this.date.getDate()} ${this.months[this.date.getMonth()]} ${this.date.getFullYear()}`;
  }
}
