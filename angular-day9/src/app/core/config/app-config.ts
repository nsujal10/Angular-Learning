import { InjectionToken } from '@angular/core';

export interface AppConfig {
  production: boolean;
  apiBaseUrl: string;
  trustedApiOrigins: string[];
  csrfHeaderName: string;
  csrfCookieName: string;
  maxFileUploadSizeBytes: number; // e.g. 5 MB
  allowedFileMimeTypes: string[];
  reconnectIntervalMs: number;
}

export const APP_CONFIG = new InjectionToken<AppConfig>('APP_CONFIG');

export const defaultAppConfig: AppConfig = {
  production: false,
  apiBaseUrl: 'https://api.enterprise-portal.internal',
  trustedApiOrigins: [
    'https://api.enterprise-portal.internal',
    'http://localhost:4200',
    'http://localhost:5000'
  ],
  csrfHeaderName: 'X-XSRF-TOKEN',
  csrfCookieName: 'XSRF-TOKEN',
  maxFileUploadSizeBytes: 5 * 1024 * 1024, // 5MB
  allowedFileMimeTypes: ['application/pdf'],
  reconnectIntervalMs: 2500
};
