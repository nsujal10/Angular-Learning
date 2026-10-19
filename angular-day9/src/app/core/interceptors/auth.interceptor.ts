import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { SecurityService } from '../services/security.service';
import { APP_CONFIG, defaultAppConfig } from '../config/app-config';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const security = inject(SecurityService);
  const config = inject(APP_CONFIG, { optional: true }) || defaultAppConfig;

  // 1. Verify that target origin is in trusted origins list
  if (!security.isOriginTrusted(req.url)) {
    // If not trusted, forward without security credentials
    return next(req);
  }

  // 2. Prepare headers map
  const headers: Record<string, string> = {};

  // Attach Bearer Token if authenticated
  const token = auth.accessToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // 3. Attach Anti-CSRF Header for state mutation methods
  const mutatingMethods = ['POST', 'PUT', 'DELETE', 'PATCH'];
  if (mutatingMethods.includes(req.method.toUpperCase())) {
    const csrfToken = auth.csrfToken();
    if (csrfToken) {
      headers[config.csrfHeaderName] = csrfToken;
    }
  }

  const clonedReq = req.clone({
    setHeaders: headers
  });

  return next(clonedReq);
};
