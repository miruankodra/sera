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
  months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  currentDate: string = '';

  ngOnInit(): void {
    this.currentDate = `${this.days[this.date.getDay()]}, ${this.date.getDate()} ${this.months[this.date.getMonth()]} ${this.date.getFullYear()}`;
  }
}
