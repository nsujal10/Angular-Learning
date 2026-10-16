import { Routes } from '@angular/router';
import { employeeDetailsResolver } from '../../core/resolvers/employee.resolver';

export const EMPLOYEE_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/employee-list/employee-list.component').then(m => m.EmployeeListComponent),
    title: 'PulseHR | Employee Directory'
  },
  {
    path: 'new',
    loadComponent: () =>
      import('./pages/employee-form/employee-form.component').then(m => m.EmployeeFormComponent),
    title: 'PulseHR | Onboard Employee'
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./pages/employee-details/employee-details.component').then(m => m.EmployeeDetailsComponent),
    resolve: {
      employee: employeeDetailsResolver
    },
    title: 'PulseHR | Employee Profile'
  },
  {
    path: ':id/edit',
    loadComponent: () =>
      import('./pages/employee-form/employee-form.component').then(m => m.EmployeeFormComponent),
    resolve: {
      employee: employeeDetailsResolver
    },
    title: 'PulseHR | Edit Employee Profile'
  }
];
