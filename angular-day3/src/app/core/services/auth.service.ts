import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { User, UserRole } from '../models/user.model';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly STORAGE_KEY = 'portal_v3_user';
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser$: Observable<User | null>;

  constructor(private router: Router) {
    const saved = localStorage.getItem(this.STORAGE_KEY);
    let initialUser: User | null = null;
    if (saved) {
      try {
        initialUser = JSON.parse(saved);
      } catch {
        initialUser = null;
      }
    } else {
      // Default initial logged-in user: Admin (allows immediate full testing or logout/switch)
      initialUser = {
        id: 'usr_admin',
        name: 'Sarah Connor (Admin)',
        email: 'admin@spikeoffice.io',
        role: 'Admin',
        avatar: 'SC'
      };
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(initialUser));
    }

    this.currentUserSubject = new BehaviorSubject<User | null>(initialUser);
    this.currentUser$ = this.currentUserSubject.asObservable();
  }

  get currentUser(): User | null {
    return this.currentUserSubject.value;
  }

  isAuthenticated(): boolean {
    return !!this.currentUserSubject.value;
  }

  isAdmin(): boolean {
    return this.currentUserSubject.value?.role === 'Admin';
  }

  isManager(): boolean {
    const role = this.currentUserSubject.value?.role;
    return role === 'Admin' || role === 'Manager';
  }

  login(email: string, role: UserRole = 'Admin'): Observable<boolean> {
    const name = email.split('@')[0];
    const user: User = {
      id: `usr_${Date.now()}`,
      name: name.charAt(0).toUpperCase() + name.slice(1),
      email,
      role,
      avatar: name.substring(0, 2).toUpperCase()
    };

    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(user));
    this.currentUserSubject.next(user);
    return of(true);
  }

  logout(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  switchRole(role: UserRole): void {
    const current = this.currentUser;
    if (current) {
      const updated: User = { ...current, role };
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updated));
      this.currentUserSubject.next(updated);
    }
  }
}
