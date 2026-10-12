import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from './core/services/auth.service';
import { LoadingService } from './core/services/loading.service';
import { NotificationService, ToastMessage } from './core/services/notification.service';
import { SimulationService } from './core/services/simulation.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  toasts: ToastMessage[] = [];

  constructor(
    public authService: AuthService,
    public loadingService: LoadingService,
    public notificationService: NotificationService,
    public simulationService: SimulationService
  ) {}

  ngOnInit(): void {
    this.notificationService.toasts.subscribe(toasts => {
      this.toasts = toasts;
    });
  }

  dismissToast(id: string): void {
    this.notificationService.remove(id);
  }
}
