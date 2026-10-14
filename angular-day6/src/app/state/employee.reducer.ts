import { createReducer, on } from '@ngrx/store';
import { Employee, INITIAL_EMPLOYEES } from '../core/models/employee.model';
import * as EmployeeActions from './employee.actions';

export interface EmployeeState {
  employees: Employee[];
  selectedEmployeeId: number | null;
  loading: boolean;
  error: string | null;
  filterQuery: string;
  lastAction: string;
}

export const initialEmployeeState: EmployeeState = {
  employees: [...INITIAL_EMPLOYEES],
  selectedEmployeeId: 1,
  loading: false,
  error: null,
  filterQuery: '',
  lastAction: 'INITIAL'
};

export const employeesReducer = createReducer(
  initialEmployeeState,

  // Load employees
  on(EmployeeActions.loadEmployees, state => ({
    ...state,
    loading: true,
    error: null,
    lastAction: 'loadEmployees'
  })),

  on(EmployeeActions.loadEmployeesSuccess, (state, { employees }) => ({
    ...state,
    employees: [...employees],
    loading: false,
    error: null,
    lastAction: 'loadEmployeesSuccess'
  })),

  on(EmployeeActions.loadEmployeesFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
    lastAction: 'loadEmployeesFailure'
  })),

  // Create employee
  on(EmployeeActions.createEmployee, state => ({
    ...state,
    loading: true,
    error: null,
    lastAction: 'createEmployee'
  })),

  on(EmployeeActions.createEmployeeSuccess, (state, { employee }) => ({
    ...state,
    employees: [...state.employees, employee],
    selectedEmployeeId: employee.id,
    loading: false,
    error: null,
    lastAction: 'createEmployeeSuccess'
  })),

  on(EmployeeActions.createEmployeeFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
    lastAction: 'createEmployeeFailure'
  })),

  // Update employee
  on(EmployeeActions.updateEmployee, state => ({
    ...state,
    loading: true,
    error: null,
    lastAction: 'updateEmployee'
  })),

  on(EmployeeActions.updateEmployeeSuccess, (state, { employee }) => ({
    ...state,
    employees: state.employees.map(e => (e.id === employee.id ? employee : e)),
    loading: false,
    error: null,
    lastAction: 'updateEmployeeSuccess'
  })),

  on(EmployeeActions.updateEmployeeFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
    lastAction: 'updateEmployeeFailure'
  })),

  // Delete employee
  on(EmployeeActions.deleteEmployee, state => ({
    ...state,
    loading: true,
    error: null,
    lastAction: 'deleteEmployee'
  })),

  on(EmployeeActions.deleteEmployeeSuccess, (state, { id }) => ({
    ...state,
    employees: state.employees.filter(e => e.id !== id),
    selectedEmployeeId: state.selectedEmployeeId === id ? null : state.selectedEmployeeId,
    loading: false,
    error: null,
    lastAction: 'deleteEmployeeSuccess'
  })),

  on(EmployeeActions.deleteEmployeeFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
    lastAction: 'deleteEmployeeFailure'
  })),

  // Select employee
  on(EmployeeActions.selectEmployee, (state, { id }) => ({
    ...state,
    selectedEmployeeId: id,
    lastAction: `selectEmployee(${id})`
  })),

  // Filter query
  on(EmployeeActions.setFilterQuery, (state, { query }) => ({
    ...state,
    filterQuery: query,
    lastAction: 'setFilterQuery'
  })),

  // Clear error
  on(EmployeeActions.clearError, state => ({
    ...state,
    error: null,
    lastAction: 'clearError'
  })),

  // Reset state
  on(EmployeeActions.resetEmployeeState, () => ({
    ...initialEmployeeState
  }))
);
