import { Injectable, computed, inject, signal } from '@angular/core';
import { ConnectionState, RealtimeNotification } from '../models/notification.model';
import { A11yAnnouncerService } from './a11y-announcer.service';

@Injectable({
  providedIn: 'root'
})
export class RealtimeService {
  private readonly announcer = inject(A11yAnnouncerService);

  readonly connectionState = signal<ConnectionState>('Disconnected');
  readonly notifications = signal<RealtimeNotification[]>([]);
  readonly reconnectAttempts = signal<number>(0);
  readonly maxReconnectAttempts = 5;

  private reconnectTimer: any = null;
  private heartbeatTimer: any = null;

  readonly unreadCount = computed(
    () => this.notifications().filter((n) => !n.isRead).length
  );

  constructor() {
    this.connect();
  }

  /**
   * Connect to SignalR / WebSocket hub
   */
  connect(): void {
    if (this.connectionState() === 'Connected' || this.connectionState() === 'Connecting') {
      return;
    }

    this.clearTimers();
    this.connectionState.set('Connecting');
    this.announcer.announce('Connecting to Real-time SignalR Hub...', 'polite');

    // Simulate connection handshake (500ms)
    setTimeout(() => {
      this.connectionState.set('Connected');
      this.reconnectAttempts.set(0);
      this.announcer.announce('Real-time Hub connected successfully.', 'polite');

      // Seed initial notification
      if (this.notifications().length === 0) {
        this.addNotification({
          id: 'notif_welcome',
          timestamp: new Date().toISOString(),
          title: 'SignalR Hub Connected',
          message: 'Real-time WebSocket protocol initialized with secure heartbeat.',
          severity: 'success',
          category: 'System',
          isRead: false
        });
      }

      this.startHeartbeat();
    }, 700);
  }

  /**
   * Disconnect the hub manually
   */
  disconnect(): void {
    this.clearTimers();
    this.connectionState.set('Disconnected');
    this.announcer.announce('Real-time Hub disconnected.', 'polite');
  }

  /**
   * Simulates an unexpected network drop to trigger reconnection handling
   */
  simulateDropAndReconnect(): void {
    if (this.connectionState() === 'Disconnected') return;

    this.clearTimers();
    this.connectionState.set('Reconnecting');
    this.reconnectAttempts.set(1);
    this.announcer.announce('Network lost. Reconnecting to Real-time Hub...', 'assertive');

    this.scheduleReconnect(1);
  }

  private scheduleReconnect(attempt: number): void {
    if (attempt > this.maxReconnectAttempts) {
      this.connectionState.set('Disconnected');
      this.announcer.announce('Real-time connection failed after maximum retry attempts.', 'assertive');
      return;
    }

    const backoffMs = Math.min(1000 * Math.pow(1.5, attempt), 10000);
    this.reconnectTimer = setTimeout(() => {
      this.reconnectAttempts.set(attempt);
      this.connectionState.set('Connected');
      this.announcer.announce(`Real-time Hub reconnected on attempt ${attempt}.`, 'polite');

      this.addNotification({
        id: 'notif_reconnected_' + Date.now(),
        timestamp: new Date().toISOString(),
        title: 'Connection Restored',
        message: `SignalR Hub re-established connection after ${attempt} retry attempt(s).`,
        severity: 'info',
        category: 'System',
        isRead: false
      });

      this.startHeartbeat();
    }, backoffMs);
  }

  /**
   * Broadcast a notification into the stream
   */
  addNotification(notif: RealtimeNotification): void {
    this.notifications.update((list) => [notif, ...list]);
    this.announcer.announce(`New notification: ${notif.title}. ${notif.message}`, 'polite');
  }

  markAllAsRead(): void {
    this.notifications.update((list) =>
      list.map((n) => ({ ...n, isRead: true }))
    );
  }

  clearNotifications(): void {
    this.notifications.set([]);
  }

  private startHeartbeat(): void {
    this.heartbeatTimer = setInterval(() => {
      // Occasional random system notification (every 45s or on demand)
    }, 45000);
  }

  private clearTimers(): void {
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    if (this.heartbeatTimer) clearInterval(this.heartbeatTimer);
    this.reconnectTimer = null;
    this.heartbeatTimer = null;
  }
}
