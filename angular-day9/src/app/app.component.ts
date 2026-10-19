import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthService } from './core/services/auth.service';
import { I18nService, AVAILABLE_LOCALES } from './core/services/i18n.service';
import { RealtimeService } from './core/services/realtime.service';
import { NotificationService } from './core/services/notification.service';
import { SupportedLocale } from './core/models/i18n.model';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  readonly auth = inject(AuthService);
  readonly i18n = inject(I18nService);
  readonly realtime = inject(RealtimeService);
  readonly notification = inject(NotificationService);
  private readonly router = inject(Router);

  readonly availableLocales = AVAILABLE_LOCALES;

  switchLocale(locale: SupportedLocale): void {
    this.i18n.setLocale(locale);
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
