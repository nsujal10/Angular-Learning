import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { NotificationService } from '../services/notification.service';

export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const notificationService = inject(NotificationService);

  if (authService.isAuthenticated() && authService.isAdmin()) {
    return true;
  }

  notificationService.error(
    'Forbidden Route',
    'Administrative privileges are strictly required to view this area.'
  );

  return router.createUrlTree(['/forbidden']);
};
