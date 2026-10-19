import { Injectable, inject } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { APP_CONFIG, defaultAppConfig } from '../config/app-config';

export interface XssScanResult {
  isSafe: boolean;
  sanitized: string;
  detectedThreats: string[];
}

@Injectable({
  providedIn: 'root'
})
export class SecurityService {
  private readonly config = inject(APP_CONFIG, { optional: true }) || defaultAppConfig;
  private readonly sanitizer = inject(DomSanitizer);

  /**
   * Validates whether a target URL belongs to trusted origins
   */
  isOriginTrusted(targetUrl: string): boolean {
    if (targetUrl.startsWith('/') && !targetUrl.startsWith('//')) {
      return true; // Relative URLs to current host are trusted
    }

    try {
      const parsed = new URL(targetUrl);
      const targetOrigin = parsed.origin;
      return this.config.trustedApiOrigins.some((trusted) => {
        const trustedOrigin = new URL(trusted).origin;
        return trustedOrigin === targetOrigin;
      });
    } catch {
      return false; // Malformed URLs are rejected
    }
  }

  /**
   * Scans untrusted input for common XSS vectors (script tags, inline event handlers, javascript: protocol)
   */
  analyzeUntrustedInput(rawInput: string): XssScanResult {
    const detectedThreats: string[] = [];

    if (/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi.test(rawInput)) {
      detectedThreats.push('Dangerous <script> tag detected');
    }

    if (/on\w+\s*=/gi.test(rawInput)) {
      detectedThreats.push('Inline event handler (e.g. onerror, onload, onclick) detected');
    }

    if (/javascript:\s*/gi.test(rawInput)) {
      detectedThreats.push('Pseudoprotocol (javascript:) detected');
    }

    if (/<iframe|<object|<embed/gi.test(rawInput)) {
      detectedThreats.push('Dangerous embedding tag (<iframe/embed/object) detected');
    }

    // Strip tags and encode characters for safe default output
    const sanitized = rawInput
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');

    return {
      isSafe: detectedThreats.length === 0,
      sanitized,
      detectedThreats
    };
  }

  /**
   * Returns sanitized HTML using Angular DomSanitizer
   */
  getTrustedHtml(untrustedSnippet: string): SafeHtml {
    // Angular DomSanitizer will sanitize script and hazardous elements
    return this.sanitizer.sanitize(1 /* SecurityContext.HTML */, untrustedSnippet) || '';
  }

  /**
   * Validates CSRF Token
   */
  verifyCsrfToken(submittedToken: string, expectedToken: string): boolean {
    if (!submittedToken || !expectedToken) return false;
    // Constant time comparison simulation
    return submittedToken === expectedToken;
  }
}
