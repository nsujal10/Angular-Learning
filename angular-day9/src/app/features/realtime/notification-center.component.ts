import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RealtimeService } from '../../core/services/realtime.service';
import { RealtimeNotification } from '../../core/models/notification.model';
import { LocalizedDatePipe } from '../../core/pipes/localized-date.pipe';
import { I18nService } from '../../core/services/i18n.service';

@Component({
  selector: 'app-notification-center',
  standalone: true,
  imports: [CommonModule, FormsModule, LocalizedDatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './notification-center.component.html',
  styleUrls: ['./notification-center.component.scss']
})
export class NotificationCenterComponent {
  readonly realtime = inject(RealtimeService);
  readonly i18n = inject(I18nService);

  readonly selectedCategory = signal<string>('All');
  readonly customTitle = signal<string>('Workforce Emergency Alert');
  readonly customCategory = signal<'HR' | 'Security' | 'Payroll' | 'System'>('HR');
  readonly customSeverity = signal<'info' | 'success' | 'warning' | 'error'>('warning');

  broadcastCustomEvent(): void {
    const notif: RealtimeNotification = {
      id: 'custom_' + Date.now(),
      timestamp: new Date().toISOString(),
      title: this.customTitle(),
      message: `Broadcasted via live SignalR/WebSocket protocol at ${new Date().toLocaleTimeString()}.`,
      severity: this.customSeverity(),
      category: this.customCategory(),
      isRead: false
    };

    this.realtime.addNotification(notif);
  }
}
