import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { UserRole } from '../../../core/models/user.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  returnUrl: string = '/dashboard';
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private notificationService: NotificationService
  ) {
    this.loginForm = this.fb.group({
      email: ['admin@spikeoffice.io', [Validators.required, Validators.email]],
      password: ['SpikePortal@123', [Validators.required, Validators.minLength(6)]],
      role: ['Admin', Validators.required]
    });
  }

  ngOnInit(): void {
    this.returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') || '/dashboard';
  }

  get f() {
    return this.loginForm.controls;
  }

  quickLogin(role: UserRole): void {
    const email = role === 'Admin'
      ? 'admin@spikeoffice.io'
      : role === 'Manager'
      ? 'manager@spikeoffice.io'
      : 'employee@spikeoffice.io';

    this.loginForm.patchValue({ email, role });
    this.onSubmit();
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      this.notificationService.error('Validation Error', 'Please check credentials.');
      return;
    }

    this.isLoading = true;
    const { email, role } = this.loginForm.value;

    this.authService.login(email, role).subscribe({
      next: () => {
        this.notificationService.success(
          'Authenticated Successfully',
          `Logged in as ${email} (${role} access).`
        );
        this.isLoading = false;
        this.router.navigateByUrl(this.returnUrl);
      },
      error: () => {
        this.isLoading = false;
        this.notificationService.error('Sign-in Error', 'Could not authenticate user.');
      }
    });
  }
}
