import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Employee {
  id: number;
  name: string;
  department: string;
  email: string;
  role?: string;
  avatar?: string;
  location?: string;
  status?: string;
}

@Injectable({
  providedIn: 'root'
})
export class EmployeeApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/employees';

  /**
   * Searches employees by name or department while typing.
   * Sends query parameter `search` to the REST backend.
   */
  searchEmployees(term: string, fail: boolean = false, delay: number = 250): Observable<Employee[]> {
    let params = new HttpParams().set('search', term);
    if (fail) params = params.set('fail', 'true');
    if (delay) params = params.set('delay', delay.toString());

    return this.http.get<Employee[]>(this.baseUrl, { params });
  }

  /**
   * Fetches full employee directory list
   */
  getAllEmployees(): Observable<Employee[]> {
    return this.http.get<Employee[]>(this.baseUrl);
  }
}
