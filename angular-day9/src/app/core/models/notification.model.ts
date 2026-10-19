export type ConnectionState =
  | 'Disconnected'
  | 'Connecting'
  | 'Connected'
  | 'Reconnecting';

export type NotificationSeverity = 'info' | 'success' | 'warning' | 'error';

export interface RealtimeNotification {
  id: string;
  timestamp: string;
  title: string;
  message: string;
  severity: NotificationSeverity;
  category: 'HR' | 'Security' | 'Payroll' | 'System';
  isRead: boolean;
}
