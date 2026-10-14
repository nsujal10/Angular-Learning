import { createAction, props } from '@ngrx/store';
import { CreateEmployeeDto, Employee, UpdateEmployeeDto } from '../core/models/employee.model';

// Loading actions
export const loadEmployees = createAction('[Employee/NgRx] Load Employees');

export const loadEmployeesSuccess = createAction(
  '[Employee/NgRx] Load Employees Success',
  props<{ employees: Employee[] }>()
);

export const loadEmployeesFailure = createAction(
  '[Employee/NgRx] Load Employees Failure',
  props<{ error: string }>()
);

// Creation actions
export const createEmployee = createAction(
  '[Employee/NgRx] Create Employee',
  props<{ employee: CreateEmployeeDto }>()
);

export const createEmployeeSuccess = createAction(
  '[Employee/NgRx] Create Employee Success',
  props<{ employee: Employee }>()
);

export const createEmployeeFailure = createAction(
  '[Employee/NgRx] Create Employee Failure',
  props<{ error: string }>()
);

// Update actions
export const updateEmployee = createAction(
  '[Employee/NgRx] Update Employee',
  props<{ id: number; changes: UpdateEmployeeDto }>()
);

export const updateEmployeeSuccess = createAction(
  '[Employee/NgRx] Update Employee Success',
  props<{ employee: Employee }>()
);

export const updateEmployeeFailure = createAction(
  '[Employee/NgRx] Update Employee Failure',
  props<{ error: string }>()
);

// Deletion actions
export const deleteEmployee = createAction(
  '[Employee/NgRx] Delete Employee',
  props<{ id: number }>()
);

export const deleteEmployeeSuccess = createAction(
  '[Employee/NgRx] Delete Employee Success',
  props<{ id: number }>()
);

export const deleteEmployeeFailure = createAction(
  '[Employee/NgRx] Delete Employee Failure',
  props<{ error: string }>()
);

// UI state actions
export const selectEmployee = createAction(
  '[Employee/NgRx] Select Employee',
  props<{ id: number | null }>()
);

export const setFilterQuery = createAction(
  '[Employee/NgRx] Set Filter Query',
  props<{ query: string }>()
);

export const clearError = createAction('[Employee/NgRx] Clear Error');

export const resetEmployeeState = createAction('[Employee/NgRx] Reset State');
