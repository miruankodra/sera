import {Component, computed, inject} from '@angular/core';
import {SeTitleComponent} from "../shared/se-title/se-title.component";
import {TranslationService} from "../../services/translation.service";

const INTL_LOCALE: Record<string, string> = {en: 'en-US', sq: 'sq-AL'};

@Component({
  selector: 'se-date',
  standalone: true,
  imports: [
    SeTitleComponent
  ],
  templateUrl: './se-date.component.html',
  styleUrl: './se-date.component.scss'
})
export class SeDateComponent {
  private _translation = inject(TranslationService);
  private _date = new Date();

  readonly currentDate = computed(() => {
    const locale = INTL_LOCALE[this._translation.locale()] ?? 'en-US';
    const formatted = new Intl.DateTimeFormat(locale, {weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'}).format(this._date);
    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
  });
}
