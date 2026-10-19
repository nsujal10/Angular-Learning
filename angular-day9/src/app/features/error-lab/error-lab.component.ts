import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-error-lab',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './error-lab.component.html',
  styleUrls: ['./error-lab.component.scss']
})
export class ErrorLabComponent {
  private readonly http = inject(HttpClient);
  private readonly notification = inject(NotificationService);

  readonly isLoading = signal<boolean>(false);
  readonly currentStatus = signal<string | null>(null);
  readonly retryCount = signal<number>(0);
  readonly errorMessage = signal<string | null>(null);

  simulateError(statusCode: number): void {
    this.isLoading.set(true);
    this.currentStatus.set(`Simulating HTTP ${statusCode}...`);
    this.errorMessage.set(null);

    // Simulated HTTP request passed through errorInterceptor
    setTimeout(() => {
      this.isLoading.set(false);
      this.currentStatus.set(`HTTP ${statusCode} Triggered`);

      const statusMap: Record<number, { text: string; msg: string }> = {
        401: { text: 'Unauthorized', msg: 'Session Expired: Please log in again.' },
        403: { text: 'Forbidden', msg: 'Access Forbidden: Insufficient permissions.' },
        404: { text: 'Not Found', msg: 'Resource Not Found: Endpoint does not exist.' },
        500: { text: 'Internal Server Error', msg: 'Backend database connection timeout.' },
        0: { text: 'Network Error', msg: 'Server unreachable (ERR_CONNECTION_REFUSED).' }
      };

      const info = statusMap[statusCode] || { text: 'Error', msg: 'Request failed.' };

      // Dispatch error directly or trigger interceptor logic
      const err = new HttpErrorResponse({
        status: statusCode,
        statusText: info.text,
        url: 'https://api.enterprise-portal.internal/test-error',
        error: { message: info.msg }
      });

      this.errorMessage.set(`${statusCode} ${info.text}: ${info.msg}`);

      this.notification.show({
        type: statusCode >= 500 || statusCode === 0 ? 'error' : 'warning',
        title: `Simulated HTTP ${statusCode}`,
        message: info.msg,
        canRetry: statusCode >= 500 || statusCode === 0,
        retryAction: () => this.retryRequest()
      });
    }, 400);
  }

  retryRequest(): void {
    this.isLoading.set(true);
    this.retryCount.update((c) => c + 1);
    this.errorMessage.set(null);

    setTimeout(() => {
      this.isLoading.set(false);
      this.currentStatus.set('Retry Successful (HTTP 200 OK)');
      this.notification.show({
        type: 'success',
        title: 'Retry Successful',
        message: `Request succeeded on attempt ${this.retryCount()}.`
      });
    }, 600);
  }
}
