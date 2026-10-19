import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'employees',
    pathMatch: 'full'
  },
  {
    path: 'employees',
    loadChildren: () =>
      import('./features/employees/employee.routes').then((m) => m.EMPLOYEE_ROUTES)
  },
  {
    path: 'reports',
    loadChildren: () =>
      import('./features/reports/reports.routes').then((m) => m.REPORT_ROUTES)
  },
  {
    path: '**',
    redirectTo: 'employees'
  }
];
