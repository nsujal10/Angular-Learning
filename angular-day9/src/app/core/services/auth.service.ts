import { Injectable, computed, signal } from '@angular/core';
import { AuthSession, LoginCredentials, Permission, ROLE_PERMISSIONS, User, UserRole } from '../models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly SESSION_STORAGE_KEY = 'enterprise_portal_session_v9';

  // Reactive state using Angular Signals
  readonly session = signal<AuthSession | null>(this.loadStoredSession());

  readonly currentUser = computed(() => this.session()?.user ?? null);
  readonly isAuthenticated = computed(() => !!this.session() && Date.now() < (this.session()?.expiresAt ?? 0));
  readonly userRole = computed<UserRole | null>(() => this.currentUser()?.role ?? null);
  readonly csrfToken = computed(() => this.session()?.csrfToken ?? 'CSRF-INITIAL-DEMO-TOKEN');
  readonly accessToken = computed(() => this.session()?.accessToken ?? null);

  constructor() {
    // If no session exists, initialize with a default Admin demo user so the user can immediately experience all features
    if (!this.session()) {
      this.loginAsRole('Admin');
    }
  }

  /**
   * Authenticate user with credentials
   */
  login(credentials: LoginCredentials): boolean {
    if (!credentials.email || !credentials.password) return false;

    let role: UserRole = 'Employee';
    if (credentials.email.includes('admin')) role = 'Admin';
    else if (credentials.email.includes('manager')) role = 'Manager';

    const session = this.buildSession({
      id: 'usr_' + Math.floor(1000 + Math.random() * 9000),
      name: credentials.email.split('@')[0].replace('.', ' '),
      email: credentials.email,
      role: role,
      department: role === 'Admin' ? 'Information Security' : 'Engineering'
    });

    this.saveSession(session);
    return true;
  }

  /**
   * Fast role switcher for live assignment testing
   */
  loginAsRole(role: UserRole): void {
    const demoUsers: Record<UserRole, User> = {
      Admin: {
        id: 'usr_admin_01',
        name: 'Alex Sterling',
        email: 'alex.sterling.admin@enterprise.io',
        role: 'Admin',
        department: 'Information Security'
      },
      Manager: {
        id: 'usr_mgr_02',
        name: 'Elena Rostova',
        email: 'elena.rostova.manager@enterprise.io',
        role: 'Manager',
        department: 'Engineering'
      },
      Employee: {
        id: 'usr_emp_03',
        name: 'Jordan Hayes',
        email: 'jordan.hayes@enterprise.io',
        role: 'Employee',
        department: 'Product & Design'
      }
    };

    const session = this.buildSession(demoUsers[role]);
    this.saveSession(session);
  }

  logout(): void {
    this.session.set(null);
    localStorage.removeItem(this.SESSION_STORAGE_KEY);
  }

  hasRole(allowedRoles: UserRole[]): boolean {
    const current = this.userRole();
    return current !== null && allowedRoles.includes(current);
  }

  hasPermission(permission: Permission): boolean {
    const current = this.userRole();
    if (!current) return false;
    const permissions = ROLE_PERMISSIONS[current] || [];
    return permissions.includes(permission);
  }

  private buildSession(user: User): AuthSession {
    const mockJwt = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${btoa(JSON.stringify(user))}.signature_simulated`;
    const mockCsrf = 'XSRF-' + Math.random().toString(36).substring(2, 15).toUpperCase();

    return {
      user,
      accessToken: mockJwt,
      refreshToken: 'refresh_' + Math.random().toString(36).substring(2),
      csrfToken: mockCsrf,
      expiresAt: Date.now() + 8 * 60 * 60 * 1000 // 8 hours
    };
  }

  private saveSession(session: AuthSession): void {
    this.session.set(session);
    try {
      localStorage.setItem(this.SESSION_STORAGE_KEY, JSON.stringify(session));
    } catch {
      // LocalStorage access fallback
    }
  }

  private loadStoredSession(): AuthSession | null {
    try {
      const stored = localStorage.getItem(this.SESSION_STORAGE_KEY);
      if (!stored) return null;
      const parsed: AuthSession = JSON.parse(stored);
      if (Date.now() > parsed.expiresAt) {
        localStorage.removeItem(this.SESSION_STORAGE_KEY);
        return null;
      }
      return parsed;
    } catch {
      return null;
    }
  }
}
