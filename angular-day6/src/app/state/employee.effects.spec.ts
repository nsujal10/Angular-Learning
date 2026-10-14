import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Action } from '@ngrx/store';
import { Observable, of, throwError } from 'rxjs';
import { Employee } from '../core/models/employee.model';
import { EmployeeApiService } from '../core/services/employee-api.service';
import * as EmployeeActions from './employee.actions';
import { EmployeeEffects } from './employee.effects';

describe('EmployeeEffects (Effect Testing with Mocked API Service)', () => {
  let effects: EmployeeEffects;
  let actions$: Observable<Action>;
  let apiServiceMock: jasmine.SpyObj<EmployeeApiService>;

  const mockEmployees: Employee[] = [
    {
      id: 1,
      name: 'Katherine Johnson',
      email: 'katherine.j@nasa.gov',
      role: 'Orbital Mechanics Lead',
      department: 'Engineering',
      status: 'Active',
      salary: 190000,
      avatar: 'https://example.com/katherine.jpg',
      performanceScore: 100,
      joinDate: '2026-01-01',
      skills: ['Orbital Trajectories', 'Mathematical Verification']
    }
  ];

  beforeEach(() => {
    apiServiceMock = jasmine.createSpyObj('EmployeeApiService', [
      'getEmployees',
      'createEmployee',
      'deleteEmployee'
    ]);

    TestBed.configureTestingModule({
      providers: [
        EmployeeEffects,
        provideMockActions(() => actions$),
        { provide: EmployeeApiService, useValue: apiServiceMock }
      ]
    });

    effects = TestBed.inject(EmployeeEffects);
  });

  it('should dispatch loadEmployeesSuccess on successful API response', (done: DoneFn) => {
    // Arrange: Mock API service returning mock data
    apiServiceMock.getEmployees.and.returnValue(of(mockEmployees));
    actions$ = of(EmployeeActions.loadEmployees());

    // Act & Assert
    effects.loadEmployees$.subscribe({
      next: action => {
        expect(action).toEqual(
          EmployeeActions.loadEmployeesSuccess({ employees: mockEmployees })
        );
        expect(apiServiceMock.getEmployees).toHaveBeenCalledTimes(1);
        done();
      },
      error: done.fail
    });
  });

  it('should dispatch loadEmployeesFailure when API throws an error', (done: DoneFn) => {
    // Arrange: Mock API service returning failure
    const errorMessage = 'Network gateway failure (504)';
    apiServiceMock.getEmployees.and.returnValue(
      throwError(() => new Error(errorMessage))
    );
    actions$ = of(EmployeeActions.loadEmployees());

    // Act & Assert
    effects.loadEmployees$.subscribe({
      next: action => {
        expect(action).toEqual(
          EmployeeActions.loadEmployeesFailure({ error: errorMessage })
        );
        done();
      },
      error: done.fail
    });
  });

  it('should dispatch createEmployeeSuccess when create API succeeds', (done: DoneFn) => {
    const createdEmployee: Employee = {
      ...mockEmployees[0],
      id: 10
    };

    apiServiceMock.createEmployee.and.returnValue(of(createdEmployee));
    actions$ = of(
      EmployeeActions.createEmployee({
        employee: {
          name: createdEmployee.name,
          email: createdEmployee.email,
          role: createdEmployee.role,
          department: createdEmployee.department,
          status: createdEmployee.status,
          salary: createdEmployee.salary,
          avatar: createdEmployee.avatar,
          performanceScore: createdEmployee.performanceScore,
          joinDate: createdEmployee.joinDate,
          skills: createdEmployee.skills
        }
      })
    );

    effects.createEmployee$.subscribe({
      next: action => {
        expect(action).toEqual(
          EmployeeActions.createEmployeeSuccess({ employee: createdEmployee })
        );
        done();
      },
      error: done.fail
    });
  });

  it('should dispatch deleteEmployeeSuccess when delete API succeeds', (done: DoneFn) => {
    apiServiceMock.deleteEmployee.and.returnValue(of(1));
    actions$ = of(EmployeeActions.deleteEmployee({ id: 1 }));

    effects.deleteEmployee$.subscribe({
      next: action => {
        expect(action).toEqual(
          EmployeeActions.deleteEmployeeSuccess({ id: 1 })
        );
        expect(apiServiceMock.deleteEmployee).toHaveBeenCalledWith(1);
        done();
      },
      error: done.fail
    });
  });
});
