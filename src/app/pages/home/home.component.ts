import {Component} from '@angular/core';
import {SeWelcomeHeaderComponent} from "../../components/se-welcome-header/se-welcome-header.component";
import {SeDateComponent} from "../../components/se-date/se-date.component";

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    SeWelcomeHeaderComponent,
    SeDateComponent
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {

}
