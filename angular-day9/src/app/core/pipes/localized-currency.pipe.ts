import { Pipe, PipeTransform, inject } from '@angular/core';
import { I18nService } from '../services/i18n.service';

@Pipe({
  name: 'localizedCurrency',
  standalone: true,
  pure: false // Reacts when currentLocale changes
})
export class LocalizedCurrencyPipe implements PipeTransform {
  private readonly i18n = inject(I18nService);

  transform(amount: number | null | undefined, currencyOverride?: string): string {
    if (amount === null || amount === undefined || isNaN(amount)) return '';
    return this.i18n.formatCurrency(amount, currencyOverride);
  }
}
