import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { NotificationService } from '../services/notification.service';

export const authGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const notification = inject(NotificationService);

  if (auth.isAuthenticated()) {
    return true;
  }

  notification.show({
    type: 'warning',
    title: 'Authentication Required',
    message: 'Please authenticate before accessing this enterprise feature.'
  });

  return router.createUrlTree(['/login'], {
    queryParams: { returnUrl: state.url }
  });
};
