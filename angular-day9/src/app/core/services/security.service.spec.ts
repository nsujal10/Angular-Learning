import { TestBed } from '@angular/core/testing';
import { SecurityService } from './security.service';
import { SafeHtmlPipe } from '../pipes/safe-html.pipe';

describe('SecurityService & SafeHtmlPipe (XSS, CSRF & Origins)', () => {
  let service: SecurityService;
  let pipe: SafeHtmlPipe;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SecurityService, SafeHtmlPipe]
    });
    service = TestBed.inject(SecurityService);
    pipe = TestBed.inject(SafeHtmlPipe);
  });

  describe('Origin Whitelist Verification', () => {
    it('should trust relative URLs on the local domain', () => {
      expect(service.isOriginTrusted('/api/employees')).toBeTrue();
      expect(service.isOriginTrusted('/v1/workforce/reports')).toBeTrue();
    });

    it('should trust configured enterprise API origins', () => {
      expect(service.isOriginTrusted('https://api.enterprise-portal.internal/v1/auth')).toBeTrue();
      expect(service.isOriginTrusted('http://localhost:4200/api')).toBeTrue();
    });

    it('should reject untrusted third-party or spoofed origins', () => {
      expect(service.isOriginTrusted('https://attacker.evil.com/steal')).toBeFalse();
      expect(service.isOriginTrusted('http://phishing-portal.com/login')).toBeFalse();
    });
  });

  describe('XSS Analysis & Sanitization', () => {
    it('should detect malicious <script> injection vectors', () => {
      const payload = '<script>alert("pwned")</script><span>Safe text</span>';
      const result = service.analyzeUntrustedInput(payload);
      expect(result.isSafe).toBeFalse();
      expect(result.detectedThreats.some((t) => t.includes('<script>'))).toBeTrue();
    });

    it('should detect inline event handlers (onerror, onload, onclick)', () => {
      const payload = '<img src="x" onerror="fetch(\'https://hacker.com\')">';
      const result = service.analyzeUntrustedInput(payload);
      expect(result.isSafe).toBeFalse();
      expect(result.detectedThreats.some((t) => t.includes('Inline event handler'))).toBeTrue();
    });

    it('should mark clean benign text as safe', () => {
      const benign = 'Hello world, welcome to enterprise portal!';
      const result = service.analyzeUntrustedInput(benign);
      expect(result.isSafe).toBeTrue();
      expect(result.detectedThreats.length).toBe(0);
    });

    it('should sanitize hazardous elements in SafeHtmlPipe', () => {
      const raw = '<b class="highlight">Bold Text</b><script>alert(1)</script>';
      const sanitized = pipe.transform(raw);
      expect(sanitized).toBeDefined();
      // Should not contain executable script tag
      expect(String(sanitized)).not.toContain('<script>');
    });
  });

  describe('CSRF Token Verification', () => {
    it('should validate matching anti-CSRF tokens', () => {
      const sessionToken = 'XSRF-SECRET-TOKEN-123';
      expect(service.verifyCsrfToken('XSRF-SECRET-TOKEN-123', sessionToken)).toBeTrue();
    });

    it('should reject tampered or missing anti-CSRF tokens', () => {
      const sessionToken = 'XSRF-SECRET-TOKEN-123';
      expect(service.verifyCsrfToken('FORGED-TOKEN-999', sessionToken)).toBeFalse();
      expect(service.verifyCsrfToken('', sessionToken)).toBeFalse();
    });
  });
});
