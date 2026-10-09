import { Routes } from '@angular/router';
import { EmployeeLayoutComponent } from './employee-layout/employee-layout.component';
import { unsavedChangesGuard } from '../../core/guards/unsaved-changes.guard';
import { employeeResolver } from '../../core/resolvers/employee.resolver';

export const EMPLOYEE_ROUTES: Routes = [
  {
    path: '',
    component: EmployeeLayoutComponent,
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./employee-list/employee-list.component').then(
            m => m.EmployeeListComponent
          ),
        title: 'SpikeHR • Employee Directory'
      },
      {
        path: 'new',
        loadComponent: () =>
          import('./employee-form/employee-form.component').then(
            m => m.EmployeeFormComponent
          ),
        canDeactivate: [unsavedChangesGuard],
        title: 'SpikeHR • Onboard Employee'
      },
      {
        path: ':id',
        loadComponent: () =>
          import('./employee-details/employee-details.component').then(
            m => m.EmployeeDetailsComponent
          ),
        resolve: {
          employee: employeeResolver
        },
        title: 'SpikeHR • Employee Profile'
      },
      {
        path: ':id/edit',
        loadComponent: () =>
          import('./employee-form/employee-form.component').then(
            m => m.EmployeeFormComponent
          ),
        canDeactivate: [unsavedChangesGuard],
        title: 'SpikeHR • Edit Employee'
      }
    ]
  }
];
