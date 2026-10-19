import { Injectable, signal } from '@angular/core';

export interface ToastAlert {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  canRetry?: boolean;
  retryAction?: () => void;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  readonly toasts = signal<ToastAlert[]>([]);

  show(toast: Omit<ToastAlert, 'id'>, durationMs = 5000): void {
    const id = 'toast_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
    const newToast: ToastAlert = { ...toast, id };

    this.toasts.update((current) => [newToast, ...current]);

    if (durationMs > 0) {
      setTimeout(() => this.remove(id), durationMs);
    }
  }

  remove(id: string): void {
    this.toasts.update((current) => current.filter((t) => t.id !== id));
  }

  clear(): void {
    this.toasts.set([]);
  }
}
