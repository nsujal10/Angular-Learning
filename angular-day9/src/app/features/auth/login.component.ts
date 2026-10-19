import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { UserRole } from '../../core/models/auth.model';
import { A11yAnnouncerService } from '../../core/services/a11y-announcer.service';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly announcer = inject(A11yAnnouncerService);
  private readonly notification = inject(NotificationService);

  readonly loginForm: FormGroup = this.fb.group({
    email: ['alex.sterling.admin@enterprise.io', [Validators.required, Validators.email]],
    password: ['SecretPass123!', [Validators.required, Validators.minLength(6)]],
    rememberMe: [true]
  });

  readonly isSubmitted = signal<boolean>(false);
  readonly errorMessage = signal<string | null>(null);

  onSubmit(): void {
    this.isSubmitted.set(true);

    if (this.loginForm.invalid) {
      this.announcer.announce('Please provide valid login credentials.', 'assertive');
      return;
    }

    const success = this.auth.login(this.loginForm.value);
    if (success) {
      this.announcer.announce(`Authenticated as ${this.auth.userRole()}. Navigating to portal.`, 'polite');
      this.notification.show({
        type: 'success',
        title: 'Authentication Successful',
        message: `Signed in as ${this.auth.currentUser()?.name} (${this.auth.userRole()}).`
      });

      const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';
      this.router.navigateByUrl(returnUrl);
    } else {
      this.errorMessage.set('Invalid credentials provided.');
    }
  }

  quickSwitchRole(role: UserRole): void {
    this.auth.loginAsRole(role);
    this.announcer.announce(`Switched persona to ${role}.`, 'polite');
    this.notification.show({
      type: 'info',
      title: 'Role Persona Active',
      message: `Now operating with ${role} permissions.`
    });

    const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';
    this.router.navigateByUrl(returnUrl);
  }
}
