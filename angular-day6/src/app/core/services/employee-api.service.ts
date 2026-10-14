import { Injectable } from '@angular/core';
import { Observable, delay, of, throwError } from 'rxjs';
import { CreateEmployeeDto, Employee, INITIAL_EMPLOYEES, UpdateEmployeeDto } from '../models/employee.model';

@Injectable({
  providedIn: 'root'
})
export class EmployeeApiService {
  private employees: Employee[] = [...INITIAL_EMPLOYEES];
  private shouldFailNext = false;

  setSimulateFailure(value: boolean): void {
    this.shouldFailNext = value;
  }

  isSimulateFailureActive(): boolean {
    return this.shouldFailNext;
  }

  getEmployees(): Observable<Employee[]> {
    if (this.shouldFailNext) {
      return throwError(() => new Error('Simulated API Network Outage (503 Service Unavailable)')).pipe(
        delay(400)
      );
    }
    return of([...this.employees]).pipe(delay(350));
  }

  searchEmployees(query: string): Observable<Employee[]> {
    if (this.shouldFailNext) {
      return throwError(() => new Error('Search API endpoint unreachable')).pipe(delay(250));
    }

    const trimmed = query.trim().toLowerCase();
    if (!trimmed) {
      return of([...this.employees]).pipe(delay(250));
    }

    const matches = this.employees.filter(
      e =>
        e.name.toLowerCase().includes(trimmed) ||
        e.role.toLowerCase().includes(trimmed) ||
        e.department.toLowerCase().includes(trimmed) ||
        e.email.toLowerCase().includes(trimmed) ||
        e.skills.some(s => s.toLowerCase().includes(trimmed))
    );

    return of(matches).pipe(delay(250));
  }

  getEmployeeById(id: number): Observable<Employee> {
    const employee = this.employees.find(e => e.id === id);
    if (!employee) {
      return throwError(() => new Error(`Employee with ID ${id} not found`)).pipe(delay(200));
    }
    return of({ ...employee }).pipe(delay(200));
  }

  createEmployee(dto: CreateEmployeeDto): Observable<Employee> {
    if (this.shouldFailNext) {
      return throwError(() => new Error('Failed to create employee: Server validation error')).pipe(
        delay(300)
      );
    }

    const newId = this.employees.length > 0 ? Math.max(...this.employees.map(e => e.id)) + 1 : 1;
    const newEmployee: Employee = {
      ...dto,
      id: newId
    };
    this.employees = [...this.employees, newEmployee];
    return of(newEmployee).pipe(delay(300));
  }

  updateEmployee(id: number, dto: UpdateEmployeeDto): Observable<Employee> {
    const index = this.employees.findIndex(e => e.id === id);
    if (index === -1) {
      return throwError(() => new Error(`Cannot update: Employee #${id} does not exist`)).pipe(
        delay(300)
      );
    }

    const updated: Employee = {
      ...this.employees[index],
      ...dto
    };
    this.employees = this.employees.map(e => (e.id === id ? updated : e));
    return of(updated).pipe(delay(300));
  }

  deleteEmployee(id: number): Observable<number> {
    const exists = this.employees.some(e => e.id === id);
    if (!exists) {
      return throwError(() => new Error(`Cannot delete: Employee #${id} not found`)).pipe(
        delay(250)
      );
    }

    this.employees = this.employees.filter(e => e.id !== id);
    return of(id).pipe(delay(250));
  }

  resetData(): void {
    this.employees = [...INITIAL_EMPLOYEES];
    this.shouldFailNext = false;
  }
}
