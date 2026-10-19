import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';
import { authGuard } from '../guards/auth.guard';
import { roleGuard } from '../guards/role.guard';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot } from '@angular/router';

describe('AuthService & Route Guards (Security & RBAC)', () => {
  let service: AuthService;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(() => {
    routerSpy = jasmine.createSpyObj('Router', ['navigate', 'navigateByUrl', 'createUrlTree']);

    TestBed.configureTestingModule({
      providers: [
        AuthService,
        { provide: Router, useValue: routerSpy }
      ]
    });

    service = TestBed.inject(AuthService);
  });

  describe('Authentication State', () => {
    it('should initialize with an authenticated session', () => {
      expect(service.isAuthenticated()).toBeTrue();
      expect(service.currentUser()).toBeTruthy();
    });

    it('should switch roles and update permissions', () => {
      service.loginAsRole('Admin');
      expect(service.userRole()).toBe('Admin');
      expect(service.hasPermission('admin_settings')).toBeTrue();
      expect(service.hasPermission('download_confidential_reports')).toBeTrue();

      service.loginAsRole('Employee');
      expect(service.userRole()).toBe('Employee');
      expect(service.hasPermission('admin_settings')).toBeFalse();
      expect(service.hasPermission('download_confidential_reports')).toBeFalse();
    });

    it('should clear session upon logout', () => {
      service.logout();
      expect(service.isAuthenticated()).toBeFalse();
      expect(service.currentUser()).toBeNull();
      expect(service.userRole()).toBeNull();
    });
  });

  describe('authGuard (CanActivateFn)', () => {
    it('should allow access if user is authenticated', () => {
      service.loginAsRole('Admin');
      const route = {} as ActivatedRouteSnapshot;
      const state = { url: '/dashboard' } as RouterStateSnapshot;

      const result = TestBed.runInInjectionContext(() => authGuard(route, state));
      expect(result).toBeTrue();
    });

    it('should redirect to /login if user is not authenticated', () => {
      service.logout();
      const route = {} as ActivatedRouteSnapshot;
      const state = { url: '/dashboard' } as RouterStateSnapshot;

      TestBed.runInInjectionContext(() => authGuard(route, state));
      expect(routerSpy.createUrlTree).toHaveBeenCalledWith(['/login'], { queryParams: { returnUrl: '/dashboard' } });
    });
  });

  describe('roleGuard (CanActivateFn)', () => {
    it('should allow access if user has one of the allowed roles', () => {
      service.loginAsRole('Admin');
      const route = { data: { roles: ['Admin', 'Manager'] } } as unknown as ActivatedRouteSnapshot;

      const result = TestBed.runInInjectionContext(() => roleGuard(route, {} as RouterStateSnapshot));
      expect(result).toBeTrue();
    });

    it('should block access and redirect if user lacks required role', () => {
      service.loginAsRole('Employee');
      const route = { data: { roles: ['Admin'] } } as unknown as ActivatedRouteSnapshot;

      TestBed.runInInjectionContext(() => roleGuard(route, {} as RouterStateSnapshot));
      expect(routerSpy.createUrlTree).toHaveBeenCalledWith(['/dashboard']);
    });
  });
});
