import {Component} from '@angular/core';
import {SeTitleComponent} from "../../../components/shared/se-title/se-title.component";
import {environment} from "../../../../environment/environment";
import {SeInputComponent} from "../../../components/shared/se-input/se-input.component";
import {SeButtonComponent} from "../../../components/shared/se-button/se-button.component";

@Component({
  selector: 'se-login',
  standalone: true,
  imports: [
    SeTitleComponent,
    SeInputComponent,
    SeButtonComponent
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {

  appName = environment.APP_NAME

}
