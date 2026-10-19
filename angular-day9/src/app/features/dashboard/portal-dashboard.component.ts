import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { I18nService, AVAILABLE_LOCALES } from '../../core/services/i18n.service';
import { RealtimeService } from '../../core/services/realtime.service';
import { SupportedLocale } from '../../core/models/i18n.model';
import { UserRole } from '../../core/models/auth.model';
import { LocalizedDatePipe } from '../../core/pipes/localized-date.pipe';
import { LocalizedCurrencyPipe } from '../../core/pipes/localized-currency.pipe';

@Component({
  selector: 'app-portal-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, LocalizedDatePipe, LocalizedCurrencyPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './portal-dashboard.component.html',
  styleUrls: ['./portal-dashboard.component.scss']
})
export class PortalDashboardComponent {
  readonly auth = inject(AuthService);
  readonly i18n = inject(I18nService);
  readonly realtime = inject(RealtimeService);

  readonly availableLocales = AVAILABLE_LOCALES;
  readonly today = new Date();
  readonly samplePayroll = 125000;

  switchLocale(locale: SupportedLocale): void {
    this.i18n.setLocale(locale);
  }

  switchRole(role: UserRole): void {
    this.auth.loginAsRole(role);
  }
}
