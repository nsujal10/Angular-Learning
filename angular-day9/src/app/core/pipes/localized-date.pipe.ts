import { Pipe, PipeTransform, inject } from '@angular/core';
import { I18nService } from '../services/i18n.service';

@Pipe({
  name: 'localizedDate',
  standalone: true,
  pure: false // Reacts when currentLocale changes
})
export class LocalizedDatePipe implements PipeTransform {
  private readonly i18n = inject(I18nService);

  transform(value: Date | string | number | null | undefined, options?: Intl.DateTimeFormatOptions): string {
    if (!value) return '';
    return this.i18n.formatDate(value, options);
  }
}
