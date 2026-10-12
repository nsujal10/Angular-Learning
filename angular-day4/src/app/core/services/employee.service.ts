import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Employee, EmployeeFilterQuery, EmployeeListResponse, Department } from '../models/employee.model';

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {
  private readonly baseUrl = '/api/employees';

  constructor(private http: HttpClient) {}

  getDepartments(): Department[] {
    return ['Engineering', 'Design', 'Product', 'Marketing', 'Human Resources', 'Finance'];
  }

  getEmployees(query: EmployeeFilterQuery = {}): Observable<EmployeeListResponse> {
    let params = new HttpParams();

    if (query.search && query.search.trim()) {
      params = params.set('search', query.search.trim());
    }
    if (query.department && query.department !== 'All') {
      params = params.set('department', query.department);
    }
    if (query.status && query.status !== 'all') {
      params = params.set('status', query.status);
    }
    if (query.sortBy) {
      params = params.set('sortBy', query.sortBy);
    }
    if (query.sortOrder) {
      params = params.set('sortOrder', query.sortOrder);
    }
    if (query.page) {
      params = params.set('page', query.page.toString());
    }
    if (query.pageSize) {
      params = params.set('pageSize', query.pageSize.toString());
    }

    return this.http.get<EmployeeListResponse>(this.baseUrl, { params });
  }

  getEmployeeById(id: number): Observable<Employee> {
    return this.http.get<Employee>(`${this.baseUrl}/${id}`);
  }

  createEmployee(employee: Omit<Employee, 'id'>): Observable<Employee> {
    return this.http.post<Employee>(this.baseUrl, employee);
  }

  updateEmployee(id: number, employee: Partial<Employee>): Observable<Employee> {
    return this.http.patch<Employee>(`${this.baseUrl}/${id}`, employee);
  }

  deleteEmployee(id: number): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.baseUrl}/${id}`);
  }

  // Failure simulation trigger: Intentionally request non-existent employee to test 404
  testNonExistentEmployee(): Observable<Employee> {
    return this.getEmployeeById(99999);
  }

  // Trigger intentional 500 server error
  testServerError(): Observable<any> {
    return this.http.post('/api/test/simulate-500', {});
  }
}
