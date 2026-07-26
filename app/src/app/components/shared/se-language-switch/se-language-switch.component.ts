import {Component, inject, input, output} from '@angular/core';
import {TranslationService, AppLocale} from '../../../services/translation.service';

@Component({
  selector: 'se-language-switch',
  standalone: true,
  imports: [],
  templateUrl: './se-language-switch.component.html',
})
export class SeLanguageSwitchComponent {
  private _translation = inject(TranslationService);

  /** Use on dark/colored backgrounds (e.g. the login hero panel). */
  dark = input(false);

  /** Fires after the locale signal + local storage are updated, for callers that also want to sync it elsewhere (e.g. the user's account). */
  localeChanged = output<AppLocale>();

  readonly locale = this._translation.locale;

  async select(locale: AppLocale): Promise<void> {
    await this._translation.setLocale(locale);
    this.localeChanged.emit(locale);
  }
}
