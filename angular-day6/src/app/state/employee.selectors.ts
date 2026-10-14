import { createFeatureSelector, createSelector } from '@ngrx/store';
import { EmployeeState } from './employee.reducer';

export const selectEmployeeState = createFeatureSelector<EmployeeState>('employees');

export const selectAllEmployees = createSelector(
  selectEmployeeState,
  state => state.employees
);

export const selectEmployeesLoading = createSelector(
  selectEmployeeState,
  state => state.loading
);

export const selectEmployeesError = createSelector(
  selectEmployeeState,
  state => state.error
);

export const selectSelectedEmployeeId = createSelector(
  selectEmployeeState,
  state => state.selectedEmployeeId
);

export const selectFilterQuery = createSelector(
  selectEmployeeState,
  state => state.filterQuery
);

export const selectLastAction = createSelector(
  selectEmployeeState,
  state => state.lastAction
);

export const selectSelectedEmployee = createSelector(
  selectAllEmployees,
  selectSelectedEmployeeId,
  (employees, selectedId) => {
    if (selectedId === null) return null;
    return employees.find(e => e.id === selectedId) || null;
  }
);

export const selectFilteredEmployees = createSelector(
  selectAllEmployees,
  selectFilterQuery,
  (employees, query) => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) return employees;
    return employees.filter(
      emp =>
        emp.name.toLowerCase().includes(trimmed) ||
        emp.role.toLowerCase().includes(trimmed) ||
        emp.department.toLowerCase().includes(trimmed) ||
        emp.email.toLowerCase().includes(trimmed)
    );
  }
);

export const selectEmployeeCount = createSelector(
  selectFilteredEmployees,
  employees => employees.length
);

export const selectTotalEmployeesCount = createSelector(
  selectAllEmployees,
  employees => employees.length
);
