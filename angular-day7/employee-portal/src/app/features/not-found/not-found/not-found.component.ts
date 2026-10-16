import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [CommonModule, RouterModule, MatButtonModule, MatIconModule, MatCardModule],
  template: `
    <div class="not-found-wrapper">
      <div class="not-found-card fade-in">
        <div class="error-code">404</div>
        <div class="icon-circle">
          <mat-icon>travel_explore</mat-icon>
        </div>
        <h2>Page Or Resource Not Found</h2>
        <p>The workforce resource, employee ID, or route you navigated to does not exist or has been relocated.</p>
        <div class="actions">
          <button mat-flat-button color="primary" routerLink="/dashboard">
            <mat-icon>dashboard</mat-icon>
            <span>Return to Dashboard</span>
          </button>
          <button mat-stroked-button routerLink="/employees">
            <mat-icon>groups</mat-icon>
            <span>Employee Directory</span>
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .not-found-wrapper {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 80vh;
      padding: 20px;
    }
    .not-found-card {
      max-width: 480px;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
      background: #ffffff;
      padding: 40px;
      border-radius: 20px;
      border: 1px solid var(--border-color);
      box-shadow: var(--shadow-card);
    }
    .error-code {
      font-size: 4rem;
      font-weight: 900;
      letter-spacing: -0.05em;
      background: var(--primary-gradient);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      line-height: 1;
    }
    .icon-circle {
      width: 64px;
      height: 64px;
      border-radius: 50%;
      background: #f1f5f9;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #64748b;
      mat-icon {
        font-size: 32px;
        width: 32px;
        height: 32px;
      }
    }
    h2 {
      font-size: 1.4rem;
      font-weight: 800;
      color: #0f172a;
      margin: 0;
    }
    p {
      font-size: 0.9rem;
      color: #64748b;
      line-height: 1.5;
      margin: 0;
    }
    .actions {
      display: flex;
      gap: 12px;
      margin-top: 8px;
      flex-wrap: wrap;
      justify-content: center;
    }
  `]
})
export class NotFoundComponent {}
