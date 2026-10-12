import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SimulationService {
  private isOfflineSubject = new BehaviorSubject<boolean>(false);
  public isOffline$ = this.isOfflineSubject.asObservable();

  private force500Subject = new BehaviorSubject<boolean>(false);
  public force500$ = this.force500Subject.asObservable();

  get isOffline(): boolean {
    return this.isOfflineSubject.value;
  }

  get force500(): boolean {
    return this.force500Subject.value;
  }

  toggleOffline(): boolean {
    const nextVal = !this.isOfflineSubject.value;
    this.isOfflineSubject.next(nextVal);
    return nextVal;
  }

  toggleForce500(): boolean {
    const nextVal = !this.force500Subject.value;
    this.force500Subject.next(nextVal);
    return nextVal;
  }

  corruptAccessToken(): void {
    // Replaces valid token with an expired mock token payload
    const expiredPayload = JSON.stringify({
      id: 'usr_test',
      email: 'test@spikeoffice.io',
      role: 'Admin',
      exp: Date.now() - 60000 // Expired 1 min ago
    });
    localStorage.setItem('v4_access_token', btoa(expiredPayload));
  }

  corruptRefreshToken(): void {
    localStorage.setItem('v4_refresh_token', 'invalid_corrupted_refresh_token');
  }
}
