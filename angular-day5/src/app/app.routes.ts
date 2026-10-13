import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'search',
    pathMatch: 'full'
  },
  {
    path: 'search',
    loadComponent: () =>
      import('./features/employee-search/employee-search.component').then(
        m => m.EmployeeSearchComponent
      ),
    title: 'SpikeHR • Live RxJS Employee Search'
  },
  {
    path: '**',
    redirectTo: 'search'
  }
];
