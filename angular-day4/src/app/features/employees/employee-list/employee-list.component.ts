import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
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
  departments: Department[] = [];
  totalCount = 0;
  totalPages = 1;
  isLoading = true;
  errorMessage: string | null = null;

  // Filter & Query States
  search = '';
  department = 'All';
  status: 'all' | 'active' | 'inactive' = 'all';
  sortBy: 'name' | 'salary' | 'department' = 'name';
  sortOrder: 'asc' | 'desc' = 'asc';
  page = 1;
  pageSize = 5;

  // Delete Confirmation Modal State
  employeeToDelete: Employee | null = null;
  isDeleting = false;

  private searchSubject = new Subject<string>();
  private subs = new Subscription();

  constructor(
    public employeeService: EmployeeService,
    public authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.departments = this.employeeService.getDepartments();

    // Debounced search typing to avoid excessive backend requests
    this.subs.add(
      this.searchSubject.pipe(
        debounceTime(350),
        distinctUntilChanged()
      ).subscribe(term => {
        this.search = term;
        this.navigateToParams({ page: 1 });
      })
    );

    // Sync with URL query parameters
    this.subs.add(
      this.route.queryParams.subscribe(params => {
        this.search = params['search'] ?? '';
        this.department = params['department'] ?? 'All';
        this.status = params['status'] ?? 'all';
        this.sortBy = params['sortBy'] ?? 'name';
        this.sortOrder = params['sortOrder'] ?? 'asc';
        this.page = params['page'] ? Number(params['page']) : 1;
        this.pageSize = params['pageSize'] ? Number(params['pageSize']) : 5;

        this.loadEmployees();
      })
    );
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  onSearchInput(value: string): void {
    this.searchSubject.next(value);
  }

  loadEmployees(): void {
    this.isLoading = true;
    this.errorMessage = null;

    this.employeeService.getEmployees({
      search: this.search,
      department: this.department,
      status: this.status,
      sortBy: this.sortBy,
      sortOrder: this.sortOrder,
      page: this.page,
      pageSize: this.pageSize
    }).subscribe({
      next: res => {
        this.employees = res.items;
        this.totalCount = res.total;
        this.totalPages = res.totalPages;
        this.page = res.page;
        this.isLoading = false;
      },
      error: err => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'Could not fetch employee list from backend API.';
      }
    });
  }

  updateFilters(): void {
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
    this.navigateToParams({ page: 1 });
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

  private navigateToParams(overrides: Record<string, any> = {}): void {
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

  // Toggle active status via PATCH /api/employees/:id
  toggleStatus(emp: Employee): void {
    const updatedStatus = !emp.active;
    this.employeeService.updateEmployee(emp.id, { active: updatedStatus }).subscribe({
      next: updated => {
        emp.active = updated.active;
        this.notificationService.success(
          'Status Updated',
          `${emp.name} is now ${emp.active ? 'Active' : 'Inactive'}.`
        );
      },
      error: () => {
        this.notificationService.error('Update Failed', 'Failed to update employee status on server.');
      }
    });
  }

  // Delete Confirmation Modal Workflow
  openDeleteModal(emp: Employee): void {
    this.employeeToDelete = emp;
  }

  closeDeleteModal(): void {
    this.employeeToDelete = null;
    this.isDeleting = false;
  }

  confirmDelete(): void {
    if (!this.employeeToDelete) return;

    this.isDeleting = true;
    const target = this.employeeToDelete;

    this.employeeService.deleteEmployee(target.id).subscribe({
      next: () => {
        this.isDeleting = false;
        this.closeDeleteModal();
        this.notificationService.success('Employee Deleted', `${target.name} has been removed from the database.`);
        this.loadEmployees();
      },
      error: () => {
        this.isDeleting = false;
        this.closeDeleteModal();
        // The interceptor will also alert 403 Forbidden if user is not Admin!
      }
    });
  }
}
