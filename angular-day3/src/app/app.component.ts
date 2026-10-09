import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from './core/services/auth.service';
import { NotificationService, ToastMessage } from './core/services/notification.service';
import { UserRole } from './core/models/user.model';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, FormsModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'SpikeHR';
  toasts: ToastMessage[] = [];

  constructor(
    public authService: AuthService,
    public notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.notificationService.toasts.subscribe(toasts => {
      this.toasts = toasts;
    });
  }

  dismissToast(id: string): void {
    this.notificationService.remove(id);
  }

  onRoleChange(newRole: string): void {
    this.authService.switchRole(newRole as UserRole);
    this.notificationService.info(
      'Session Role Updated',
      `Switched current session to "${newRole}". Test your route guards now!`
    );
  }
}
