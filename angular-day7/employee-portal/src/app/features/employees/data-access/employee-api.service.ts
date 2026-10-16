import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, tap, catchError, throwError, delay } from 'rxjs';
import {
  Employee,
  CreateEmployeeRequest,
  UpdateEmployeeRequest,
  DashboardStats
} from '../../../core/models/employee.model';

@Injectable({
  providedIn: 'root'
})
export class EmployeeApiService {
  private http = inject(HttpClient);
  private readonly API_URL = 'http://localhost:5000/api/employees';

  // State Signals
  private employeesSignal = signal<Employee[]>([]);
  private selectedEmployeeSignal = signal<Employee | null>(null);
  private dashboardStatsSignal = signal<DashboardStats | null>(null);
  private isLoadingSignal = signal<boolean>(false);
  private errorMessageSignal = signal<string | null>(null);

  // Readonly public signals
  readonly employees = this.employeesSignal.asReadonly();
  readonly selectedEmployee = this.selectedEmployeeSignal.asReadonly();
  readonly dashboardStats = this.dashboardStatsSignal.asReadonly();
  readonly isLoading = this.isLoadingSignal.asReadonly();
  readonly errorMessage = this.errorMessageSignal.asReadonly();

  // Computed state
  readonly totalEmployees = computed(() => this.employees().length);
  readonly activeEmployees = computed(() => this.employees().filter(e => e.status === 'Active').length);
  readonly onLeaveEmployees = computed(() => this.employees().filter(e => e.status === 'OnLeave').length);
  readonly departments = computed(() => {
    const set = new Set(this.employees().map(e => e.department));
    return Array.from(set);
  });

  // Built-in seed cache for offline / fallback stability
  private mockEmployees: Employee[] = [
    {
      id: 1,
      firstName: 'Sujal',
      lastName: 'Nage',
      email: 'sujal.nage@pulsehr.io',
      phone: '+1 (555) 019-2834',
      department: 'Engineering',
      role: 'Lead Angular Architect',
      salary: 145000,
      joiningDate: '2025-03-15',
      status: 'Active',
      performanceScore: 96,
      avatar: 'SN',
      bio: 'Enterprise architect specialized in Standalone Angular, Signals, and ASP.NET Core microservices.'
    },
    {
      id: 2,
      firstName: 'Sarah',
      lastName: 'Connor',
      email: 'sarah.connor@pulsehr.io',
      phone: '+1 (555) 014-9921',
      department: 'Engineering',
      role: 'VP of Engineering',
      salary: 185000,
      joiningDate: '2023-08-01',
      status: 'Active',
      performanceScore: 98,
      avatar: 'SC',
      bio: 'Leads engineering operations, architecture councils, and scalable workforce development.'
    },
    {
      id: 3,
      firstName: 'Alex',
      lastName: 'Mercer',
      email: 'alex.mercer@pulsehr.io',
      phone: '+1 (555) 018-4412',
      department: 'Engineering',
      role: 'Senior Full Stack Developer',
      salary: 120000,
      joiningDate: '2025-06-10',
      status: 'Active',
      performanceScore: 90,
      avatar: 'AM',
      bio: 'Specialist in ASP.NET Core Web APIs, Angular Signals, and enterprise authentication.'
    },
    {
      id: 4,
      firstName: 'Elena',
      lastName: 'Rostova',
      email: 'elena.rostova@pulsehr.io',
      phone: '+1 (555) 012-7788',
      department: 'Design',
      role: 'Lead UI/UX Designer',
      salary: 115000,
      joiningDate: '2025-10-01',
      status: 'Active',
      performanceScore: 94,
      avatar: 'ER',
      bio: 'Crafts design systems, accessibility audits, and Angular Material component themes.'
    },
    {
      id: 5,
      firstName: 'Marcus',
      lastName: 'Vance',
      email: 'marcus.vance@pulsehr.io',
      phone: '+1 (555) 017-3329',
      department: 'Product',
      role: 'Principal Product Manager',
      salary: 140000,
      joiningDate: '2024-04-18',
      status: 'Active',
      performanceScore: 92,
      avatar: 'MV',
      bio: 'Drives product vision, sprint roadmaps, and stakeholder metric analysis.'
    },
    {
      id: 6,
      firstName: 'Chloe',
      lastName: 'Price',
      email: 'chloe.price@pulsehr.io',
      phone: '+1 (555) 015-8832',
      department: 'HR',
      role: 'HR Director',
      salary: 105000,
      joiningDate: '2024-11-20',
      status: 'OnLeave',
      performanceScore: 88,
      avatar: 'CP',
      bio: 'Directs global talent acquisition, workplace policies, and benefits management.'
    },
    {
      id: 7,
      firstName: 'David',
      lastName: 'Kim',
      email: 'david.kim@pulsehr.io',
      phone: '+1 (555) 016-1199',
      department: 'Finance',
      role: 'Financial Controller',
      salary: 130000,
      joiningDate: '2023-12-05',
      status: 'Active',
      performanceScore: 95,
      avatar: 'DK',
      bio: 'Oversees payroll systems, equity allocations, and fiscal governance.'
    },
    {
      id: 8,
      firstName: 'Rachel',
      lastName: 'Amber',
      email: 'rachel.amber@pulsehr.io',
      phone: '+1 (555) 011-5544',
      department: 'Marketing',
      role: 'Growth Marketing Lead',
      salary: 98000,
      joiningDate: '2026-01-15',
      status: 'Active',
      performanceScore: 89,
      avatar: 'RA',
      bio: 'Orchestrates brand campaigns, developer relations, and conversion funnels.'
    }
  ];

  constructor() {
    this.employeesSignal.set([...this.mockEmployees]);
  }

  // Load all employees with optional query filters
  getEmployees(search?: string, department?: string, status?: string): Observable<Employee[]> {
    this.isLoadingSignal.set(true);
    this.errorMessageSignal.set(null);

    let params = new HttpParams();
    if (search) params = params.set('search', search);
    if (department && department !== 'All') params = params.set('department', department);
    if (status && status !== 'All') params = params.set('status', status);

    return this.http.get<Employee[]>(this.API_URL, { params }).pipe(
      tap(employees => {
        this.employeesSignal.set(employees);
        this.isLoadingSignal.set(false);
      }),
      catchError(err => {
        // Fallback filter over mock data
        let filtered = [...this.mockEmployees];
        if (search) {
          const s = search.toLowerCase();
          filtered = filtered.filter(e =>
            e.firstName.toLowerCase().includes(s) ||
            e.lastName.toLowerCase().includes(s) ||
            e.email.toLowerCase().includes(s) ||
            e.role.toLowerCase().includes(s)
          );
        }
        if (department && department !== 'All') {
          filtered = filtered.filter(e => e.department.toLowerCase() === department.toLowerCase());
        }
        if (status && status !== 'All') {
          filtered = filtered.filter(e => e.status.toLowerCase() === status.toLowerCase());
        }

        this.employeesSignal.set(filtered);
        this.isLoadingSignal.set(false);
        return of(filtered);
      })
    );
  }

  // Load single employee by ID
  getEmployeeById(id: number): Observable<Employee> {
    this.isLoadingSignal.set(true);
    this.errorMessageSignal.set(null);

    return this.http.get<Employee>(`${this.API_URL}/${id}`).pipe(
      tap(employee => {
        this.selectedEmployeeSignal.set(employee);
        this.isLoadingSignal.set(false);
      }),
      catchError(err => {
        const found = this.mockEmployees.find(e => e.id === Number(id));
        this.isLoadingSignal.set(false);
        if (found) {
          this.selectedEmployeeSignal.set(found);
          return of(found);
        }
        this.errorMessageSignal.set(`Employee #${id} not found.`);
        return throwError(() => new Error(`Employee #${id} not found`));
      })
    );
  }

  // Create new employee
  createEmployee(payload: CreateEmployeeRequest): Observable<Employee> {
    this.isLoadingSignal.set(true);
    this.errorMessageSignal.set(null);

    return this.http.post<Employee>(this.API_URL, payload).pipe(
      tap(created => {
        this.employeesSignal.update(list => [...list, created]);
        this.mockEmployees.push(created);
        this.isLoadingSignal.set(false);
      }),
      catchError(err => {
        // Fallback local create
        const newId = this.mockEmployees.length ? Math.max(...this.mockEmployees.map(e => e.id)) + 1 : 1;
        const newEmployee: Employee = {
          id: newId,
          ...payload,
          status: payload.status as 'Active' | 'OnLeave' | 'Terminated',
          avatar: `${payload.firstName[0]}${payload.lastName[0]}`.toUpperCase(),
          createdAt: new Date().toISOString()
        };
        this.mockEmployees.push(newEmployee);
        this.employeesSignal.update(list => [...list, newEmployee]);
        this.isLoadingSignal.set(false);
        return of(newEmployee);
      })
    );
  }

  // Update existing employee
  updateEmployee(id: number, payload: UpdateEmployeeRequest): Observable<Employee> {
    this.isLoadingSignal.set(true);
    this.errorMessageSignal.set(null);

    return this.http.put<Employee>(`${this.API_URL}/${id}`, payload).pipe(
      tap(updated => {
        this.employeesSignal.update(list => list.map(e => e.id === id ? updated : e));
        const index = this.mockEmployees.findIndex(e => e.id === id);
        if (index !== -1) this.mockEmployees[index] = updated;
        this.selectedEmployeeSignal.set(updated);
        this.isLoadingSignal.set(false);
      }),
      catchError(err => {
        const index = this.mockEmployees.findIndex(e => e.id === Number(id));
        if (index !== -1) {
          const updated: Employee = {
            ...this.mockEmployees[index],
            ...payload,
            status: payload.status as 'Active' | 'OnLeave' | 'Terminated',
            avatar: `${payload.firstName[0]}${payload.lastName[0]}`.toUpperCase(),
            updatedAt: new Date().toISOString()
          };
          this.mockEmployees[index] = updated;
          this.employeesSignal.update(list => list.map(e => e.id === Number(id) ? updated : e));
          this.selectedEmployeeSignal.set(updated);
          this.isLoadingSignal.set(false);
          return of(updated);
        }
        this.isLoadingSignal.set(false);
        return throwError(() => err);
      })
    );
  }

  // Delete employee
  deleteEmployee(id: number): Observable<boolean> {
    this.isLoadingSignal.set(true);

    return this.http.delete<any>(`${this.API_URL}/${id}`).pipe(
      tap(() => {
        this.employeesSignal.update(list => list.filter(e => e.id !== id));
        this.mockEmployees = this.mockEmployees.filter(e => e.id !== id);
        this.isLoadingSignal.set(false);
      }),
      catchError(err => {
        this.employeesSignal.update(list => list.filter(e => e.id !== Number(id)));
        this.mockEmployees = this.mockEmployees.filter(e => e.id !== Number(id));
        this.isLoadingSignal.set(false);
        return of(true);
      })
    );
  }

  // Load Dashboard KPIs & Distribution metrics
  getDashboardStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${this.API_URL}/dashboard/stats`).pipe(
      tap(stats => this.dashboardStatsSignal.set(stats)),
      catchError(err => {
        // Calculate dynamic stats from current dataset
        const employees = this.employeesSignal();
        const deptMap: Record<string, number> = {};
        const statusMap: Record<string, number> = {};

        employees.forEach(e => {
          deptMap[e.department] = (deptMap[e.department] || 0) + 1;
          statusMap[e.status] = (statusMap[e.status] || 0) + 1;
        });

        const totalSalary = employees.reduce((sum, e) => sum + e.salary, 0);
        const avgScore = employees.length ? (employees.reduce((sum, e) => sum + e.performanceScore, 0) / employees.length) : 0;

        const stats: DashboardStats = {
          totalEmployees: employees.length,
          activeEmployees: statusMap['Active'] || 0,
          onLeaveEmployees: statusMap['OnLeave'] || 0,
          totalPayroll: totalSalary,
          averageSalary: employees.length ? Math.round(totalSalary / employees.length) : 0,
          averagePerformance: Math.round(avgScore * 10) / 10,
          departmentDistribution: deptMap,
          statusDistribution: statusMap,
          recentHires: employees.slice(-5).map(e => ({
            id: e.id,
            name: `${e.firstName} ${e.lastName}`,
            role: e.role,
            department: e.department,
            joiningDate: e.joiningDate,
            status: e.status
          }))
        };

        this.dashboardStatsSignal.set(stats);
        return of(stats);
      })
    );
  }
}
