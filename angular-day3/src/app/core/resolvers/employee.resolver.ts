import { inject } from '@angular/core';
import { ResolveFn, Router } from '@angular/router';
import { Employee } from '../models/employee.model';
import { EmployeeService } from '../services/employee.service';
import { NotificationService } from '../services/notification.service';

export const employeeResolver: ResolveFn<Employee | null> = (route, state) => {
  const employeeService = inject(EmployeeService);
  const router = inject(Router);
  const notificationService = inject(NotificationService);

  const idParam = route.paramMap.get('id');
  if (!idParam) {
    return null;
  }

  const id = Number(idParam);
  if (isNaN(id)) {
    notificationService.error('Invalid ID', 'Employee identifier must be numeric.');
    router.navigate(['/employees']);
    return null;
  }

  const employee = employeeService.getEmployeeById(id);
  if (!employee) {
    notificationService.error('Not Found', `Employee with ID #${id} does not exist.`);
    router.navigate(['/employees']);
    return null;
  }

  return employee;
};
