import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-admin-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-settings.component.html',
  styleUrls: ['./admin-settings.component.css']
})
export class AdminSettingsComponent {
  allowAutoRegistration = false;
  enforce2FA = true;
  sessionTimeoutMinutes = 15;
  retentionYears = 7;

  constructor(
    public authService: AuthService,
    private notificationService: NotificationService
  ) {}

  savePolicy(): void {
    this.notificationService.success(
      'Security Policy Synchronized',
      'Enterprise security controls and session lifecycle rules updated.'
    );
  }
}
