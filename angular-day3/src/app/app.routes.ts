import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login.component').then(
        m => m.LoginComponent
      ),
    title: 'SpikeHR • Portal Login'
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./features/dashboard/dashboard.component').then(
        m => m.DashboardComponent
      ),
    canActivate: [authGuard],
    title: 'SpikeHR • Workforce Dashboard'
  },
  {
    path: 'employees',
    loadChildren: () =>
      import('./features/employees/employee.routes').then(
        m => m.EMPLOYEE_ROUTES
      ),
    canActivate: [authGuard]
  },
  {
    path: 'settings',
    loadComponent: () =>
      import('./features/settings/settings.component').then(
        m => m.SettingsComponent
      ),
    canActivate: [authGuard, adminGuard],
    title: 'SpikeHR • Organization Settings'
  },
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];
