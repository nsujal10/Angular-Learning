import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, concatMap, map, mergeMap, switchMap } from 'rxjs/operators';
import { EmployeeApiService } from '../core/services/employee-api.service';
import * as EmployeeActions from './employee.actions';

@Injectable()
export class EmployeeEffects {
  private readonly actions$ = inject(Actions);
  private readonly apiService = inject(EmployeeApiService);

  loadEmployees$ = createEffect(() =>
    this.actions$.pipe(
      ofType(EmployeeActions.loadEmployees),
      switchMap(() =>
        this.apiService.getEmployees().pipe(
          map(employees => EmployeeActions.loadEmployeesSuccess({ employees })),
          catchError(error =>
            of(
              EmployeeActions.loadEmployeesFailure({
                error: error.message || 'Failed to load employees from API'
              })
            )
          )
        )
      )
    )
  );

  createEmployee$ = createEffect(() =>
    this.actions$.pipe(
      ofType(EmployeeActions.createEmployee),
      concatMap(({ employee }) =>
        this.apiService.createEmployee(employee).pipe(
          map(created => EmployeeActions.createEmployeeSuccess({ employee: created })),
          catchError(error =>
            of(
              EmployeeActions.createEmployeeFailure({
                error: error.message || 'Failed to create employee'
              })
            )
          )
        )
      )
    )
  );

  deleteEmployee$ = createEffect(() =>
    this.actions$.pipe(
      ofType(EmployeeActions.deleteEmployee),
      mergeMap(({ id }) =>
        this.apiService.deleteEmployee(id).pipe(
          map(deletedId => EmployeeActions.deleteEmployeeSuccess({ id: deletedId })),
          catchError(error =>
            of(
              EmployeeActions.deleteEmployeeFailure({
                error: error.message || 'Failed to delete employee'
              })
            )
          )
        )
      )
    )
  );
}
