import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { NotificationService } from '../services/notification.service';
import { UserRole } from '../models/auth.model';

export const roleGuard: CanActivateFn = (route) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const notification = inject(NotificationService);

  const allowedRoles = (route.data?.['roles'] as UserRole[]) || [];

  if (allowedRoles.length === 0 || auth.hasRole(allowedRoles)) {
    return true;
  }

  notification.show({
    type: 'error',
    title: '403 Forbidden',
    message: `Access denied. This page requires one of the following roles: ${allowedRoles.join(', ')}.`
  });

  return router.createUrlTree(['/dashboard']);
};
