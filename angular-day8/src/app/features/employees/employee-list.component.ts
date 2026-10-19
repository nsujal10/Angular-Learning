import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Employee, Department, EmployeeStatus } from '../../core/models/employee.model';
import { EmployeeService } from '../../core/services/employee.service';
import { AnalyticsPanelComponent } from './components/analytics-panel/analytics-panel.component';

@Component({
  selector: 'app-employee-list',
  standalone: true,
  imports: [CommonModule, FormsModule, AnalyticsPanelComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './employee-list.component.html',
  styleUrls: ['./employee-list.component.scss']
})
export class EmployeeListComponent implements OnInit {
  private readonly employeeService = inject(EmployeeService);

  // Core reactive state using Angular Signals
  readonly employees = signal<Employee[]>([]);
  readonly isLoading = signal<boolean>(false);
  readonly errorMessage = signal<string | null>(null);

  // Search & Filtering Signals
  readonly searchQuery = signal<string>('');
  readonly selectedDepartment = signal<string>('All');
  readonly selectedStatus = signal<string>('All');
  readonly sortField = signal<'name' | 'salary' | 'department' | 'performanceScore'>('name');
  readonly sortDirection = signal<'asc' | 'desc'>('asc');

  // Pagination Signals
  readonly currentPage = signal<number>(1);
  readonly pageSize = signal<number>(5);
  readonly availablePageSizes = [5, 10, 20];

  // Quick-Add Modal State
  readonly isModalOpen = signal<boolean>(false);
  readonly newEmployeeForm = signal<Omit<Employee, 'id'>>({
    name: '',
    email: '',
    role: '',
    department: 'Engineering',
    salary: 85000,
    status: 'Active',
    location: '',
    joinedDate: new Date().toISOString().split('T')[0],
    performanceScore: 4.5
  });

  readonly departments: Department[] = [
    'Engineering',
    'Design',
    'Product',
    'Marketing',
    'Human Resources',
    'Finance'
  ];

  readonly statuses: EmployeeStatus[] = ['Active', 'Inactive', 'On Leave'];

  // Derived filtered employees computed reactively
  readonly filteredEmployees = computed(() => {
    const query = this.searchQuery().trim().toLowerCase();
    const dept = this.selectedDepartment();
    const status = this.selectedStatus();
    const field = this.sortField();
    const dir = this.sortDirection();

    let result = this.employees().filter((emp) => {
      const matchesSearch =
        !query ||
        emp.name.toLowerCase().includes(query) ||
        emp.email.toLowerCase().includes(query) ||
        emp.role.toLowerCase().includes(query) ||
        emp.location.toLowerCase().includes(query);

      const matchesDept = dept === 'All' || emp.department === dept;
      const matchesStatus = status === 'All' || emp.status === status;

      return matchesSearch && matchesDept && matchesStatus;
    });

    // Sort result
    result = [...result].sort((a, b) => {
      const valA = a[field];
      const valB = b[field];

      if (typeof valA === 'string' && typeof valB === 'string') {
        const comp = valA.localeCompare(valB);
        return dir === 'asc' ? comp : -comp;
      }

      if (typeof valA === 'number' && typeof valB === 'number') {
        return dir === 'asc' ? valA - valB : valB - valA;
      }

      return 0;
    });

    return result;
  });

  // Derived pagination calculations with computed()
  readonly totalCount = computed(() => this.filteredEmployees().length);

  readonly totalPages = computed(() => {
    const count = this.totalCount();
    const size = this.pageSize();
    return Math.max(1, Math.ceil(count / size));
  });

  readonly pagedEmployees = computed(() => {
    const page = Math.min(this.currentPage(), this.totalPages());
    const size = this.pageSize();
    const start = (page - 1) * size;
    return this.filteredEmployees().slice(start, start + size);
  });

  readonly startIndex = computed(() => {
    if (this.totalCount() === 0) return 0;
    return (Math.min(this.currentPage(), this.totalPages()) - 1) * this.pageSize() + 1;
  });

  readonly endIndex = computed(() => {
    return Math.min(this.startIndex() + this.pageSize() - 1, this.totalCount());
  });

  // Summary Metrics Signals
  readonly activeCount = computed(
    () => this.employees().filter((e) => e.status === 'Active').length
  );
  readonly onLeaveCount = computed(
    () => this.employees().filter((e) => e.status === 'On Leave').length
  );
  readonly totalPayroll = computed(() =>
    this.employees().reduce((sum, e) => sum + e.salary, 0)
  );

  ngOnInit(): void {
    this.loadEmployees();
  }

  loadEmployees(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.employeeService.getEmployees().subscribe({
      next: (data) => {
        this.employees.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        // Fallback to initial mock data for seamless demo when local mock API is not hosted
        this.employees.set(this.employeeService.getInitialSeedEmployees());
        this.isLoading.set(false);
      }
    });
  }

  // Immutable Updates on Signals for OnPush Change Detection
  toggleStatus(id: number): void {
    this.employees.update((currentList) =>
      currentList.map((emp) => {
        if (emp.id !== id) return emp;
        const nextStatus: EmployeeStatus =
          emp.status === 'Active' ? 'Inactive' : 'Active';
        return { ...emp, status: nextStatus };
      })
    );
  }

  adjustSalary(id: number, delta: number): void {
    this.employees.update((currentList) =>
      currentList.map((emp) => {
        if (emp.id !== id) return emp;
        return { ...emp, salary: Math.max(30000, emp.salary + delta) };
      })
    );
  }

  deleteEmployee(id: number): void {
    this.employees.update((currentList) =>
      currentList.filter((emp) => emp.id !== id)
    );
    // Ensure currentPage does not exceed totalPages after deletion
    if (this.currentPage() > this.totalPages()) {
      this.currentPage.set(this.totalPages());
    }
  }

  openAddModal(): void {
    this.isModalOpen.set(true);
  }

  closeAddModal(): void {
    this.isModalOpen.set(false);
  }

  updateNewEmployeeField<K extends keyof Omit<Employee, 'id'>>(field: K, value: Omit<Employee, 'id'>[K]): void {
    this.newEmployeeForm.update((form) => ({ ...form, [field]: value }));
  }

  saveNewEmployee(): void {
    const form = this.newEmployeeForm();
    if (!form.name || !form.email || !form.role) return;

    const newEmp: Employee = {
      ...form,
      id: Math.floor(1000 + Math.random() * 9000)
    };

    // Immutable prepend
    this.employees.update((list) => [newEmp, ...list]);
    this.closeAddModal();

    // Reset form
    this.newEmployeeForm.set({
      name: '',
      email: '',
      role: '',
      department: 'Engineering',
      salary: 85000,
      status: 'Active',
      location: '',
      joinedDate: new Date().toISOString().split('T')[0],
      performanceScore: 4.5
    });
  }

  updateSearch(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchQuery.set(input.value);
    this.currentPage.set(1);
  }

  setDepartment(dept: string): void {
    this.selectedDepartment.set(dept);
    this.currentPage.set(1);
  }

  setStatus(status: string): void {
    this.selectedStatus.set(status);
    this.currentPage.set(1);
  }

  setSort(field: 'name' | 'salary' | 'department' | 'performanceScore'): void {
    if (this.sortField() === field) {
      this.sortDirection.set(this.sortDirection() === 'asc' ? 'desc' : 'asc');
    } else {
      this.sortField.set(field);
      this.sortDirection.set('asc');
    }
  }

  setPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
    }
  }

  onPageSizeChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.pageSize.set(Number(select.value));
    this.currentPage.set(1);
  }

  trackById(index: number, employee: Employee): number {
    return employee.id;
  }
}
