import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { NotificationService } from '../services/notification.service';
import { A11yAnnouncerService } from '../services/a11y-announcer.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const notification = inject(NotificationService);
  const announcer = inject(A11yAnnouncerService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let friendlyMessage = 'An unexpected system error occurred. Please try again.';

      switch (error.status) {
        case 401:
          friendlyMessage = 'Session Expired or Unauthorized: Please log in again to continue.';
          auth.logout();
          announcer.announce(friendlyMessage, 'assertive');
          notification.show({
            type: 'error',
            title: '401 Unauthorized',
            message: friendlyMessage
          });
          break;

        case 403:
          friendlyMessage = 'Access Forbidden: You do not have the required permissions to perform this action.';
          announcer.announce(friendlyMessage, 'assertive');
          notification.show({
            type: 'error',
            title: '403 Forbidden',
            message: friendlyMessage
          });
          break;

        case 404:
          friendlyMessage = 'Resource Not Found: The requested endpoint or record could not be located.';
          notification.show({
            type: 'warning',
            title: '404 Not Found',
            message: friendlyMessage
          });
          break;

        case 500:
          friendlyMessage = 'Internal Server Error: The backend encountered an unexpected condition.';
          notification.show({
            type: 'error',
            title: '500 Server Error',
            message: friendlyMessage,
            canRetry: true
          });
          break;

        case 0:
          friendlyMessage = 'Network Error: Unable to reach the server. Please check your internet connection or CORS settings.';
          notification.show({
            type: 'error',
            title: 'Network Failure',
            message: friendlyMessage,
            canRetry: true
          });
          break;

        default:
          friendlyMessage = error.error?.message || `Error (${error.status}): ${error.statusText || 'Request failed'}`;
          notification.show({
            type: 'error',
            title: `HTTP ${error.status}`,
            message: friendlyMessage
          });
          break;
      }

      return throwError(() => new Error(friendlyMessage));
    })
  );
};
