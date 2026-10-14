import { Employee, INITIAL_EMPLOYEES } from '../core/models/employee.model';
import * as EmployeeActions from './employee.actions';
import { EmployeeState, employeesReducer, initialEmployeeState } from './employee.reducer';

describe('employeesReducer (Pure Reducer Tests - Zero HTTP Requests)', () => {
  const mockEmployee: Employee = {
    id: 99,
    name: 'Ada Lovelace',
    email: 'ada@computing.org',
    role: 'Algorithm Engineer',
    department: 'Engineering',
    status: 'Active',
    salary: 180000,
    avatar: 'https://example.com/ada.jpg',
    performanceScore: 100,
    joinDate: '2026-01-01',
    skills: ['Algorithms', 'Analysis']
  };

  it('should return initial state when unknown action is provided', () => {
    const action = { type: '[Unknown] Action' } as any;
    const state = employeesReducer(undefined, action);

    expect(state).toEqual(initialEmployeeState);
  });

  describe('loadEmployees lifecycle', () => {
    it('should set loading to true and clear error on loadEmployees', () => {
      const priorState: EmployeeState = {
        ...initialEmployeeState,
        loading: false,
        error: 'Prior error'
      };

      const state = employeesReducer(priorState, EmployeeActions.loadEmployees());

      expect(state.loading).toBeTrue();
      expect(state.error).toBeNull();
      expect(state.lastAction).toBe('loadEmployees');
    });

    it('should update employees list, reset loading and error on loadEmployeesSuccess', () => {
      const loadingState: EmployeeState = {
        ...initialEmployeeState,
        loading: true,
        error: null
      };

      const payload = [mockEmployee];
      const state = employeesReducer(
        loadingState,
        EmployeeActions.loadEmployeesSuccess({ employees: payload })
      );

      expect(state.loading).toBeFalse();
      expect(state.error).toBeNull();
      expect(state.employees.length).toBe(1);
      expect(state.employees[0]).toEqual(mockEmployee);
      expect(state.lastAction).toBe('loadEmployeesSuccess');
    });

    it('should set error message and disable loading on loadEmployeesFailure', () => {
      const loadingState: EmployeeState = {
        ...initialEmployeeState,
        loading: true
      };

      const errorMsg = '503 Service Unavailable';
      const state = employeesReducer(
        loadingState,
        EmployeeActions.loadEmployeesFailure({ error: errorMsg })
      );

      expect(state.loading).toBeFalse();
      expect(state.error).toBe(errorMsg);
      expect(state.lastAction).toBe('loadEmployeesFailure');
    });
  });

  describe('createEmployee lifecycle', () => {
    it('should append new employee and update selection on createEmployeeSuccess', () => {
      const state = employeesReducer(
        initialEmployeeState,
        EmployeeActions.createEmployeeSuccess({ employee: mockEmployee })
      );

      expect(state.loading).toBeFalse();
      expect(state.employees.some(e => e.id === 99)).toBeTrue();
      expect(state.selectedEmployeeId).toBe(99);
      expect(state.employees.length).toBe(initialEmployeeState.employees.length + 1);
    });

    it('should register error on createEmployeeFailure', () => {
      const state = employeesReducer(
        initialEmployeeState,
        EmployeeActions.createEmployeeFailure({ error: 'Validation failed' })
      );

      expect(state.loading).toBeFalse();
      expect(state.error).toBe('Validation failed');
    });
  });

  describe('updateEmployee and deleteEmployee', () => {
    it('should modify specific employee immutably on updateEmployeeSuccess', () => {
      const updatedMock: Employee = {
        ...initialEmployeeState.employees[0],
        role: 'Chief Architect'
      };

      const state = employeesReducer(
        initialEmployeeState,
        EmployeeActions.updateEmployeeSuccess({ employee: updatedMock })
      );

      expect(state.employees[0].role).toBe('Chief Architect');
      expect(state.employees[1]).toEqual(initialEmployeeState.employees[1]);
    });

    it('should remove employee and clear selectedEmployeeId if matched on deleteEmployeeSuccess', () => {
      const targetId = 1;
      const priorState: EmployeeState = {
        ...initialEmployeeState,
        selectedEmployeeId: targetId
      };

      const state = employeesReducer(
        priorState,
        EmployeeActions.deleteEmployeeSuccess({ id: targetId })
      );

      expect(state.employees.some(e => e.id === targetId)).toBeFalse();
      expect(state.selectedEmployeeId).toBeNull();
    });

    it('should retain selectedEmployeeId if another employee is deleted', () => {
      const priorState: EmployeeState = {
        ...initialEmployeeState,
        selectedEmployeeId: 1
      };

      const state = employeesReducer(
        priorState,
        EmployeeActions.deleteEmployeeSuccess({ id: 2 })
      );

      expect(state.selectedEmployeeId).toBe(1);
    });
  });

  describe('UI State Actions', () => {
    it('should update selectedEmployeeId on selectEmployee', () => {
      const state = employeesReducer(
        initialEmployeeState,
        EmployeeActions.selectEmployee({ id: 5 })
      );

      expect(state.selectedEmployeeId).toBe(5);
    });

    it('should update filterQuery on setFilterQuery', () => {
      const state = employeesReducer(
        initialEmployeeState,
        EmployeeActions.setFilterQuery({ query: 'DevOps' })
      );

      expect(state.filterQuery).toBe('DevOps');
    });

    it('should clear error on clearError action', () => {
      const stateWithError: EmployeeState = {
        ...initialEmployeeState,
        error: 'Network Timeout'
      };

      const state = employeesReducer(stateWithError, EmployeeActions.clearError());
      expect(state.error).toBeNull();
    });

    it('should restore initial state on resetEmployeeState', () => {
      const modifiedState: EmployeeState = {
        employees: [],
        selectedEmployeeId: 99,
        loading: true,
        error: 'Some error',
        filterQuery: 'test',
        lastAction: 'MUTATED'
      };

      const state = employeesReducer(modifiedState, EmployeeActions.resetEmployeeState());
      expect(state).toEqual(initialEmployeeState);
    });
  });
});
