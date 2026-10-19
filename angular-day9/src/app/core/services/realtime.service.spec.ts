import { TestBed } from '@angular/core/testing';
import { RealtimeService } from './realtime.service';

describe('RealtimeService (SignalR / WebSocket & Reconnection)', () => {
  let service: RealtimeService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [RealtimeService]
    });
    service = TestBed.inject(RealtimeService);
  });

  it('should initialize connection attempt on startup', () => {
    expect(['Connecting', 'Connected']).toContain(service.connectionState());
  });

  it('should transition to Disconnected when disconnect is called', () => {
    service.disconnect();
    expect(service.connectionState()).toBe('Disconnected');
  });

  it('should handle simulated connection drop and enter Reconnecting state', () => {
    service.connect();
    service.simulateDropAndReconnect();
    expect(service.connectionState()).toBe('Reconnecting');
    expect(service.reconnectAttempts()).toBeGreaterThan(0);
  });

  it('should receive notifications and update unread count', () => {
    service.addNotification({
      id: 'test_notif_01',
      timestamp: new Date().toISOString(),
      title: 'Emergency Drill',
      message: 'Scheduled evacuation drill at 2 PM.',
      severity: 'warning',
      category: 'HR',
      isRead: false
    });

    expect(service.notifications().length).toBeGreaterThan(0);
    expect(service.notifications()[0].title).toBe('Emergency Drill');
    expect(service.unreadCount()).toBeGreaterThan(0);

    service.markAllAsRead();
    expect(service.unreadCount()).toBe(0);
  });
});
