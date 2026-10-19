import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, of, throwError } from 'rxjs';
import { Employee } from '../models/employee.model';
import { INITIAL_EMPLOYEES } from '../data/mock-employees';

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {
  private readonly http = inject(HttpClient);
  public readonly apiUrl = '/api/employees';

  /**
   * Fetches the complete list of employees from the REST endpoint.
   */
  getEmployees(): Observable<Employee[]> {
    return this.http.get<Employee[]>(this.apiUrl).pipe(
      catchError((error: HttpErrorResponse) => this.handleError(error))
    );
  }

  /**
   * Fetches an individual employee by ID.
   */
  getEmployeeById(id: number): Observable<Employee> {
    return this.http.get<Employee>(`${this.apiUrl}/${id}`).pipe(
      catchError((error: HttpErrorResponse) => this.handleError(error))
    );
  }

  /**
   * Creates a new employee record.
   */
  createEmployee(employee: Omit<Employee, 'id'>): Observable<Employee> {
    return this.http.post<Employee>(this.apiUrl, employee).pipe(
      catchError((error: HttpErrorResponse) => this.handleError(error))
    );
  }

  /**
   * Updates an existing employee record.
   */
  updateEmployee(id: number, changes: Partial<Employee>): Observable<Employee> {
    return this.http.put<Employee>(`${this.apiUrl}/${id}`, changes).pipe(
      catchError((error: HttpErrorResponse) => this.handleError(error))
    );
  }

  /**
   * Deletes an employee by ID.
   */
  deleteEmployee(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      catchError((error: HttpErrorResponse) => this.handleError(error))
    );
  }

  /**
   * Provides initial seed data for local preview when API is unavailable.
   */
  getInitialSeedEmployees(): Employee[] {
    return [...INITIAL_EMPLOYEES];
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An unexpected error occurred';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Client error: ${error.error.message}`;
    } else {
      errorMessage = `Server returned code ${error.status}: ${error.statusText || error.message}`;
    }
    return throwError(() => new Error(errorMessage));
  }
}
