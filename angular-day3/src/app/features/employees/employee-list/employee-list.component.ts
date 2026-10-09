import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { EmployeeService } from '../../../core/services/employee.service';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Employee, Department } from '../../../core/models/employee.model';

@Component({
  selector: 'app-employee-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './employee-list.component.html',
  styleUrls: ['./employee-list.component.css']
})
export class EmployeeListComponent implements OnInit, OnDestroy {
  employees: Employee[] = [];
  totalCount: number = 0;
  departments: Department[] = [];

  // Query Param State
  search: string = '';
  department: string = 'All';
  status: 'all' | 'active' | 'inactive' = 'all';
  sortBy: 'name' | 'salary' | 'department' = 'name';
  sortOrder: 'asc' | 'desc' = 'asc';
  page: number = 1;
  pageSize: number = 5;

  private querySub?: Subscription;

  constructor(
    public employeeService: EmployeeService,
    public authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.departments = this.employeeService.getDepartments();

    // Listen to query parameters from URL
    this.querySub = this.route.queryParams.subscribe(params => {
      this.search = params['search'] ?? '';
      this.department = params['department'] ?? 'All';
      this.status = params['status'] ?? 'all';
      this.sortBy = params['sortBy'] ?? 'name';
      this.sortOrder = params['sortOrder'] ?? 'asc';
      this.page = params['page'] ? Number(params['page']) : 1;
      this.pageSize = params['pageSize'] ? Number(params['pageSize']) : 5;

      this.fetchData();
    });
  }

  ngOnDestroy(): void {
    this.querySub?.unsubscribe();
  }

  fetchData(): void {
    const result = this.employeeService.filterEmployees({
      search: this.search,
      department: this.department,
      status: this.status,
      sortBy: this.sortBy,
      sortOrder: this.sortOrder,
      page: this.page,
      pageSize: this.pageSize
    });

    this.employees = result.items;
    this.totalCount = result.total;
  }

  updateFilters(): void {
    // Reset page to 1 when search or filters change
    this.navigateToParams({ page: 1 });
  }

  changePage(newPage: number): void {
    if (newPage < 1 || newPage > this.totalPages) return;
    this.navigateToParams({ page: newPage });
  }

  toggleSort(column: 'name' | 'salary' | 'department'): void {
    if (this.sortBy === column) {
      this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortBy = column;
      this.sortOrder = 'asc';
    }
    this.navigateToParams({ sortBy: this.sortBy, sortOrder: this.sortOrder, page: 1 });
  }

  resetFilters(): void {
    this.search = '';
    this.department = 'All';
    this.status = 'all';
    this.sortBy = 'name';
    this.sortOrder = 'asc';
    this.page = 1;
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {}
    });
  }

  private navigateToParams(overrides: Partial<any> = {}): void {
    const qParams: any = {
      search: this.search.trim() || null,
      department: this.department !== 'All' ? this.department : null,
      status: this.status !== 'all' ? this.status : null,
      sortBy: this.sortBy,
      sortOrder: this.sortOrder,
      page: overrides['page'] ?? this.page,
      pageSize: this.pageSize
    };

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: qParams,
      queryParamsHandling: 'merge'
    });
  }

  get totalPages(): number {
    return Math.ceil(this.totalCount / this.pageSize) || 1;
  }

  toggleStatus(emp: Employee): void {
    this.employeeService.toggleActiveStatus(emp.id);
    this.notificationService.info(
      'Status Updated',
      `${emp.name} is now ${emp.active ? 'Active' : 'Inactive'}.`
    );
    this.fetchData();
  }

  deleteEmployee(emp: Employee): void {
    if (!this.authService.isAdmin()) {
      this.notificationService.error('Unauthorized', 'Only Administrators can delete employee profiles.');
      return;
    }

    const confirmed = confirm(`Are you sure you want to permanently remove ${emp.name}?`);
    if (confirmed) {
      this.employeeService.deleteEmployee(emp.id);
      this.notificationService.success('Record Deleted', `${emp.name} has been removed.`);
      this.fetchData();
    }
  }
}
