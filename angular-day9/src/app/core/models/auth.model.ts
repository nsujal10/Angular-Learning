export type UserRole = 'Admin' | 'Manager' | 'Employee';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  avatarUrl?: string;
}

export interface AuthSession {
  user: User;
  accessToken: string;
  refreshToken: string;
  csrfToken: string;
  expiresAt: number; // Unix timestamp
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export type Permission =
  | 'view_employees'
  | 'edit_employees'
  | 'delete_employees'
  | 'upload_documents'
  | 'download_confidential_reports'
  | 'admin_settings';

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  Admin: [
    'view_employees',
    'edit_employees',
    'delete_employees',
    'upload_documents',
    'download_confidential_reports',
    'admin_settings'
  ],
  Manager: [
    'view_employees',
    'edit_employees',
    'upload_documents',
    'download_confidential_reports'
  ],
  Employee: [
    'view_employees',
    'upload_documents'
  ]
};
