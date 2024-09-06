import {Component, inject} from '@angular/core';
import {SeTitleComponent} from "../../../components/shared/se-title/se-title.component";
import {environment} from "../../../../environments/environment";
import {SeInputComponent} from "../../../components/shared/se-input/se-input.component";
import {SeButtonComponent} from "../../../components/shared/se-button/se-button.component";
import {HttpService} from "../../../services/http.service";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";

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
  private _httpService: HttpService = inject(HttpService);
  private formBuilder = inject(FormBuilder);
  loginForm: FormGroup;

  constructor() {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.min(8)]],
    });
  }


  // async login(): Promise

}
