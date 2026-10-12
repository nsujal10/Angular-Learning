import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';

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
  serverErrorMsg: string | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private notificationService: NotificationService
  ) {
    this.loginForm = this.fb.group({
      email: ['admin@spikeoffice.io', [Validators.required, Validators.email]],
      password: ['Admin@123', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit(): void {
    this.returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') || '/dashboard';
  }

  get f() {
    return this.loginForm.controls;
  }

  quickFill(email: string, pass: string): void {
    this.serverErrorMsg = null;
    this.loginForm.patchValue({ email, password: pass });
    this.onSubmit();
  }

  // Step 5: Test failure scenario - intentionally bad credentials
  testWrongCredentials(): void {
    this.loginForm.patchValue({
      email: 'admin@spikeoffice.io',
      password: 'WrongPassword999!'
    });
    this.onSubmit();
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.serverErrorMsg = null;
    const { email, password } = this.loginForm.value;

    this.authService.login({ email, password }).subscribe({
      next: res => {
        this.isLoading = false;
        this.notificationService.success(
          'Authentication Successful',
          `Welcome back, ${res.user.name} (${res.user.role} role).`
        );
        this.router.navigateByUrl(this.returnUrl);
      },
      error: err => {
        this.isLoading = false;
        this.serverErrorMsg = err.error?.message || 'Invalid email or password.';
        this.notificationService.error('Sign-in Error', this.serverErrorMsg || 'Failed to authenticate');
      }
    });
  }
}
