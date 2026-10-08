import { Component, OnInit, AfterViewInit, OnDestroy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Employee } from '../../../core/models/employee.model';
import { EmployeeService } from '../../../core/services/employee.service';
import { LifecycleLoggerService, LifecycleLogEntry } from '../../../core/services/lifecycle-logger.service';
import { EmployeeListComponent } from '../employee-list/employee-list';
import { EmployeeDetailsComponent } from '../employee-details/employee-details';
import { EmployeeSearchComponent, EmployeeFilterCriteria } from '../employee-search/employee-search';

@Component({
  selector: 'app-employee-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    EmployeeListComponent,
    EmployeeDetailsComponent,
    EmployeeSearchComponent
  ],
  templateUrl: './employee-dashboard.html',
  styleUrl: './employee-dashboard.css'
})
export class EmployeeDashboardComponent implements OnInit, AfterViewInit, OnDestroy {
  // 47. Dependency Injection using inject()
  private employeeService = inject(EmployeeService);
  logger = inject(LifecycleLoggerService);

  // 47. Data from EmployeeService
  private allEmployees = signal<Employee[]>([]);

  // 44. Selected Employee state
  selectedEmployee = signal<Employee | null>(null);

  // Filter criteria from search
  private filterCriteria = signal<EmployeeFilterCriteria>({
    searchTerm: '',
    department: 'All Departments',
    status: 'all'
  });

  // Modal / form state for adding a new employee to trigger lifecycle hooks
  isAddModalOpen = signal<boolean>(false);
  newEmployee = {
    name: '',
    email: '',
    department: 'Engineering',
    role: '',
    salary: 60000,
    active: true
  };

  // Toggle for Architecture Exercise viewer
  showArchitectureInspector = signal<boolean>(false);

  // 42. Computed filtered employees passed down to child EmployeeList
  filteredEmployees = computed(() => {
    const list = this.allEmployees();
    const { searchTerm, department, status } = this.filterCriteria();

    return list.filter(emp => {
      const matchesSearch =
        !searchTerm ||
        emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.email.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesDept =
        department === 'All Departments' || emp.department === department;

      const matchesStatus =
        status === 'all' ||
        (status === 'active' && emp.active) ||
        (status === 'inactive' && !emp.active);

      return matchesSearch && matchesDept && matchesStatus;
    });
  });

  // 46. Lifecycle Logging as requested
  ngOnInit(): void {
    console.log('EmployeeDashboard initialized');
    this.logger.log('EmployeeDashboard', 'OnInit');
    this.loadEmployees();
  }

  ngAfterViewInit(): void {
    console.log('EmployeeDashboard view initialized');
    this.logger.log('EmployeeDashboard', 'AfterViewInit');
  }

  ngOnDestroy(): void {
    console.log('EmployeeDashboard destroyed');
    this.logger.log('EmployeeDashboard', 'OnDestroy');
  }

  loadEmployees(): void {
    this.allEmployees.set(this.employeeService.getEmployees());
  }

  // 43 & 44. Child -> Parent selection flow
  onEmployeeSelected(employee: Employee): void {
    this.selectedEmployee.set(employee);
  }

  onDetailsClosed(): void {
    this.selectedEmployee.set(null);
  }

  // Action handlers mutating service state & triggering lifecycle events
  onEmployeeDeleted(id: number): void {
    this.employeeService.removeEmployee(id);
    this.loadEmployees();

    if (this.selectedEmployee()?.id === id) {
      this.selectedEmployee.set(null);
    }
  }

  onStatusToggled(id: number): void {
    this.employeeService.toggleActiveStatus(id);
    this.loadEmployees();

    const selected = this.selectedEmployee();
    if (selected && selected.id === id) {
      const updated = this.employeeService.getEmployeeById(id);
      this.selectedEmployee.set(updated || null);
    }
  }

  onFilterChanged(criteria: EmployeeFilterCriteria): void {
    this.filterCriteria.set(criteria);
  }

  openAddModal(): void {
    this.newEmployee = {
      name: '',
      email: '',
      department: 'Engineering',
      role: '',
      salary: 75000,
      active: true
    };
    this.isAddModalOpen.set(true);
  }

  closeAddModal(): void {
    this.isAddModalOpen.set(false);
  }

  saveNewEmployee(): void {
    if (!this.newEmployee.name.trim() || !this.newEmployee.role.trim()) {
      return;
    }

    const created = this.employeeService.addEmployee({
      name: this.newEmployee.name.trim(),
      email: this.newEmployee.email.trim() || `${this.newEmployee.name.toLowerCase().replace(/\s+/g, '.')}@example.com`,
      department: this.newEmployee.department,
      role: this.newEmployee.role.trim(),
      salary: Number(this.newEmployee.salary) || 60000,
      active: this.newEmployee.active
    });

    this.loadEmployees();
    this.closeAddModal();
    this.selectedEmployee.set(created);
  }

  clearLogs(): void {
    this.logger.clear();
  }
}
