import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login.component').then((m) => m.LoginComponent)
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/dashboard/portal-dashboard.component').then((m) => m.PortalDashboardComponent)
  },
  {
    path: 'employees',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/employees/employee-form.component').then((m) => m.EmployeeFormComponent)
  },
  {
    path: 'security',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/security-xss/security-demo.component').then((m) => m.SecurityDemoComponent)
  },
  {
    path: 'files',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/files/file-portal.component').then((m) => m.FilePortalComponent)
  },
  {
    path: 'realtime',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/realtime/notification-center.component').then((m) => m.NotificationCenterComponent)
  },
  {
    path: 'error-lab',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/error-lab/error-lab.component').then((m) => m.ErrorLabComponent)
  },
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];
