import {Component, inject, signal} from '@angular/core';
import {SeTitleComponent} from "../../../components/shared/se-title/se-title.component";
import {environment} from "../../../../environments/environment";
import {SeInputComponent} from "../../../components/shared/se-input/se-input.component";
import {SeButtonComponent} from "../../../components/shared/se-button/se-button.component";
import {SeLanguageSwitchComponent} from "../../../components/shared/se-language-switch/se-language-switch.component";
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {LoginValidationErrors} from "../../../models/errors/validation/login-validation-errors";
import {ToastService} from "../../../services/toast.service";
import {AuthService} from "../../../services/auth.service";
import {TranslationService} from "../../../services/translation.service";
import {TranslatePipe} from "../../../pipes/translate.pipe";

@Component({
  selector: 'se-login',
  standalone: true,
  imports: [
    SeTitleComponent,
    SeInputComponent,
    SeButtonComponent,
    SeLanguageSwitchComponent,
    ReactiveFormsModule,
    TranslatePipe,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  appName = environment.APP_NAME;
  loading = signal(false);

  private _authService = inject(AuthService);
  private _toastService = inject(ToastService);
  private _formBuilder = inject(FormBuilder);
  private _translation = inject(TranslationService);

  loginForm: FormGroup = this._formBuilder.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

  async login(): Promise<void> {
    if (this.loginForm.invalid || this.loading()) return;

    this.loading.set(true);
    try {
      const {email, password} = this.loginForm.value;
      await this._authService.login(email, password);
    } catch {
      await this._toastService.fireToast(this._translation.translate('auth.incorrectCredentials'));
    } finally {
      this.loading.set(false);
    }
  }

  protected readonly LoginValidationErrors = LoginValidationErrors;
}
