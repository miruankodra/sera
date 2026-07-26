import {Pipe, PipeTransform, inject} from '@angular/core';
import {TranslationService} from '../services/translation.service';

@Pipe({
  name: 'translate',
  standalone: true,
  pure: false, // must re-run when TranslationService.locale() changes, not just when `key` changes
})
export class TranslatePipe implements PipeTransform {
  private _translation = inject(TranslationService);

  transform(key: string, params?: Record<string, string | number>): string {
    return this._translation.translate(key, params);
  }
}
