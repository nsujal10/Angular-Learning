import { inject } from '@angular/core';
import { ResolveFn, Router } from '@angular/router';
import { Observable, catchError, EMPTY } from 'rxjs';
import { Employee } from '../models/employee.model';
import { EmployeeApiService } from '../../features/employees/data-access/employee-api.service';

export const employeeDetailsResolver: ResolveFn<Employee> = (route, state) => {
  const employeeApi = inject(EmployeeApiService);
  const router = inject(Router);
  const id = Number(route.paramMap.get('id'));

  if (!id || isNaN(id)) {
    router.navigate(['/employees']);
    return EMPTY;
  }

  return employeeApi.getEmployeeById(id).pipe(
    catchError(() => {
      router.navigate(['/not-found']);
      return EMPTY;
    })
  );
};
