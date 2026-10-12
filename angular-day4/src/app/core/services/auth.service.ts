import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, throwError, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { User, LoginCredentials, AuthResponse, RefreshResponse } from '../models/auth.model';
import { NotificationService } from './notification.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly ACCESS_TOKEN_KEY = 'v4_access_token';
  private readonly REFRESH_TOKEN_KEY = 'v4_refresh_token';
  private readonly USER_KEY = 'v4_user';

  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  private isRefreshing = false;
  private refreshTokenSubject = new BehaviorSubject<string | null>(null);

  constructor(
    private http: HttpClient,
    private router: Router,
    private notificationService: NotificationService
  ) {
    this.restoreSession();
  }

  private restoreSession(): void {
    const storedUser = localStorage.getItem(this.USER_KEY);
    const token = this.getAccessToken();

    if (storedUser && token) {
      try {
        const user: User = JSON.parse(storedUser);
        this.currentUserSubject.next(user);
      } catch {
        this.clearSession();
      }
    }
  }

  get currentUser(): User | null {
    return this.currentUserSubject.value;
  }

  getAccessToken(): string | null {
    return localStorage.getItem(this.ACCESS_TOKEN_KEY);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  isAuthenticated(): boolean {
    return !!this.getAccessToken() && !!this.currentUserSubject.value;
  }

  isAdmin(): boolean {
    return this.currentUserSubject.value?.role === 'Admin';
  }

  isManager(): boolean {
    const role = this.currentUserSubject.value?.role;
    return role === 'Admin' || role === 'Manager';
  }

  login(credentials: LoginCredentials): Observable<AuthResponse> {
    return this.http.post<AuthResponse>('/api/auth/login', credentials).pipe(
      tap(res => {
        localStorage.setItem(this.ACCESS_TOKEN_KEY, res.accessToken);
        localStorage.setItem(this.REFRESH_TOKEN_KEY, res.refreshToken);
        localStorage.setItem(this.USER_KEY, JSON.stringify(res.user));
        this.currentUserSubject.next(res.user);
      })
    );
  }

  refreshToken(): Observable<RefreshResponse> {
    const currentRefreshToken = this.getRefreshToken();
    if (!currentRefreshToken) {
      this.clearSession();
      return throwError(() => new Error('No refresh token available'));
    }

    return this.http.post<RefreshResponse>('/api/auth/refresh', {
      refreshToken: currentRefreshToken
    }).pipe(
      tap(res => {
        localStorage.setItem(this.ACCESS_TOKEN_KEY, res.accessToken);
        localStorage.setItem(this.REFRESH_TOKEN_KEY, res.refreshToken);
      }),
      catchError(err => {
        this.clearSession();
        this.notificationService.error(
          'Session Expired',
          'Your session has expired. Please sign in again.'
        );
        this.router.navigate(['/login']);
        return throwError(() => err);
      })
    );
  }

  logout(): void {
    const currentRefreshToken = this.getRefreshToken();
    if (currentRefreshToken) {
      this.http.post('/api/auth/logout', { refreshToken: currentRefreshToken }).subscribe({
        error: () => {} // ignore backend logout error
      });
    }

    this.clearSession();
    this.notificationService.info('Signed Out', 'You have been logged out of the portal.');
    this.router.navigate(['/login']);
  }

  clearSession(): void {
    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.currentUserSubject.next(null);
  }
}
