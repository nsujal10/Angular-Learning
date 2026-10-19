import { TestBed } from '@angular/core/testing';
import { I18nService } from './i18n.service';
import { LocalizedCurrencyPipe } from '../pipes/localized-currency.pipe';
import { LocalizedDatePipe } from '../pipes/localized-date.pipe';

describe('I18nService & Localization Pipes (Internationalization)', () => {
  let service: I18nService;
  let currencyPipe: LocalizedCurrencyPipe;
  let datePipe: LocalizedDatePipe;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [I18nService, LocalizedCurrencyPipe, LocalizedDatePipe]
    });
    service = TestBed.inject(I18nService);
    currencyPipe = TestBed.inject(LocalizedCurrencyPipe);
    datePipe = TestBed.inject(LocalizedDatePipe);
  });

  it('should initialize with default en-US locale', () => {
    expect(service.currentLocale()).toBe('en-US');
    expect(service.currentLocaleInfo().currency).toBe('USD');
    expect(service.t().portalTitle).toContain('Enterprise Employee Portal');
  });

  it('should switch dynamically between locales and update translations', () => {
    service.setLocale('es-ES');
    expect(service.currentLocale()).toBe('es-ES');
    expect(service.currentLocaleInfo().currency).toBe('EUR');
    expect(service.t().portalTitle).toContain('Portal Empresarial de Empleados');

    service.setLocale('de-DE');
    expect(service.currentLocale()).toBe('de-DE');
    expect(service.t().portalTitle).toContain('Unternehmens-Mitarbeiterportal');
  });

  it('should format currency accurately according to active locale', () => {
    service.setLocale('en-US');
    const formattedUsd = currencyPipe.transform(85000);
    expect(formattedUsd).toContain('$');
    expect(formattedUsd).toContain('85,000');

    service.setLocale('es-ES');
    const formattedEur = currencyPipe.transform(85000);
    expect(formattedEur).toContain('€');
  });

  it('should format dates appropriately according to locale', () => {
    const testDate = new Date('2025-06-15T10:00:00Z');

    service.setLocale('en-US');
    const usDate = datePipe.transform(testDate);
    expect(usDate).toContain('2025');

    service.setLocale('de-DE');
    const deDate = datePipe.transform(testDate);
    expect(deDate).toContain('2025');
  });
});
