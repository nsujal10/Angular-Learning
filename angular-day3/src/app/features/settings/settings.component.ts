import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { UserRole } from '../../core/models/user.model';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent {
  companyName = 'SpikeHR Technologies Inc.';
  fiscalYear = '2026';
  allowSelfRegistration = false;
  requireTwoFactor = true;

  constructor(
    public authService: AuthService,
    private notificationService: NotificationService
  ) {}

  saveSettings(): void {
    this.notificationService.success(
      'System Settings Saved',
      'Global administrative preferences have been synchronized.'
    );
  }

  testRoleDemote(role: UserRole): void {
    this.authService.switchRole(role);
    this.notificationService.warning(
      'Session Role Downgraded',
      `Switched to "${role}". Try navigating here again to observe AdminGuard intercepting access!`
    );
  }
}
