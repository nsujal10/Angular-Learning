import { inject } from '@angular/core';
import {
  HttpInterceptorFn,
  HttpRequest,
  HttpHandlerFn,
  HttpErrorResponse
} from '@angular/common/http';
import { Router } from '@angular/router';
import { throwError } from 'rxjs';
import { catchError, switchMap, finalize } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { LoadingService } from '../services/loading.service';
import { NotificationService } from '../services/notification.service';
import { SimulationService } from '../services/simulation.service';

export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
  const authService = inject(AuthService);
  const loadingService = inject(LoadingService);
  const notificationService = inject(NotificationService);
  const simulationService = inject(SimulationService);
  const router = inject(Router);

  // Step 5: Offline failure simulation check
  if (simulationService.isOffline) {
    const offlineErr = new HttpErrorResponse({
      error: { message: 'Network offline: could not reach backend API.' },
      status: 0,
      statusText: 'Unknown Error (Simulated Offline Mode)',
      url: req.url
    });
    notificationService.error('Backend Offline', 'Simulated network disconnect: API is currently unreachable.');
    return throwError(() => offlineErr);
  }

  // Track global loading indicator
  loadingService.show();

  // Attach token and simulation headers
  let authReq = req;
  const token = authService.getAccessToken();

  let headersConfig: Record<string, string> = {};
  if (token && !req.url.includes('/api/auth/login')) {
    headersConfig['Authorization'] = `Bearer ${token}`;
  }

  if (simulationService.force500) {
    headersConfig['X-Simulate-Error'] = '500';
  }

  if (Object.keys(headersConfig).length > 0) {
    authReq = req.clone({
      setHeaders: headersConfig
    });
  }

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // 401 Unauthorized handling (Expired Session / Token Refresh)
      if (error.status === 401) {
        const isAuthEndpoint = req.url.includes('/api/auth/login') || req.url.includes('/api/auth/refresh');

        if (!isAuthEndpoint && authService.getRefreshToken()) {
          // Attempt automatic token refresh
          return authService.refreshToken().pipe(
            switchMap(refreshRes => {
              // Retry original request with new access token
              const retryReq = req.clone({
                setHeaders: {
                  Authorization: `Bearer ${refreshRes.accessToken}`
                }
              });
              notificationService.info('Session Refreshed', 'Automatic token renewal completed successfully.');
              return next(retryReq);
            }),
            catchError(refreshErr => {
              return throwError(() => refreshErr);
            })
          );
        }
      }

      // 403 Forbidden handling (Step 4 Authorization)
      if (error.status === 403) {
        notificationService.error(
          'Access Forbidden (403)',
          error.error?.message || 'You do not have the required permissions for this action.'
        );
        router.navigate(['/forbidden']);
      } else if (error.status === 0) {
        notificationService.error(
          'Connection Error',
          'Failed to communicate with backend server at http://localhost:3000.'
        );
      } else if (error.status === 500) {
        notificationService.error(
          'Server Error (500)',
          error.error?.message || 'Internal Server Error encountered.'
        );
      } else if (error.status === 404 && !req.url.includes('/api/test/')) {
        notificationService.warning(
          'Resource Not Found (404)',
          error.error?.message || 'Requested item does not exist.'
        );
      }

      return throwError(() => error);
    }),
    finalize(() => {
      loadingService.hide();
    })
  );
};
