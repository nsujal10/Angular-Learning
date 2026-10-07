import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Employee, INITIAL_EMPLOYEES } from '../models/employee.model';
import { EmployeeListComponent } from '../employee-list/employee-list.component';
import { EmployeeCardComponent } from '../employee-card/employee-card.component';

/**
 * EmployeeDashboardComponent
 * Container component that orchestrates state, statistics, filtering, and child components.
 * 
 * Key Concepts demonstrated in Day 1:
 * - Standalone Components: imports FormsModule, CommonModule, and child components directly
 * - Two-way data binding: [(ngModel)] for the search box
 * - Getter properties: get filteredEmployees() for real-time list filtering without RxJS complexity
 * - Property binding: [disabled]="!selectedEmployee"
 * - Event handling: selectEmployee(employee)
 * - Computed statistics for dashboard metrics
 */
@Component({
  selector: 'app-employee-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    EmployeeListComponent,
    EmployeeCardComponent
  ],
  templateUrl: './employee-dashboard.component.html',
  styleUrl: './employee-dashboard.component.css'
})
export class EmployeeDashboardComponent {
  /**
   * Master employee dataset initialized with at least 10 employees.
   */
  employees: Employee[] = INITIAL_EMPLOYEES;

  /**
   * Search input model bound via [(ngModel)]="searchText".
   * Requirement 5: Search input binding
   */
  searchText: string = '';

  /**
   * Currently selected employee. Null if none is selected.
   * Controls the state of the details card and the disabled status of action buttons.
   */
  selectedEmployee: Employee | null = null;

  /**
   * Modal flag to showcase "View Details" action dialog.
   */
  isDetailModalOpen: boolean = false;

  /**
   * Requirement 6: Filter using TypeScript getter
   * Filters the employee dataset dynamically based on `searchText`.
   * Case-insensitive search across name, department, role, and email.
   * Note: No RxJS is used here as per Day 1 requirements.
   */
  get filteredEmployees(): Employee[] {
    const query = this.searchText.trim().toLowerCase();
    if (!query) {
      return this.employees;
    }

    return this.employees.filter((emp: Employee) =>
      emp.name.toLowerCase().includes(query) ||
      emp.department.toLowerCase().includes(query) ||
      emp.role.toLowerCase().includes(query) ||
      emp.email.toLowerCase().includes(query)
    );
  }

  // ==========================================
  // Statistics Getters for Dashboard UI
  // ==========================================

  /**
   * Total number of employees in the organization.
   */
  get totalEmployees(): number {
    return this.employees.length;
  }

  /**
   * Count of currently active employees.
   */
  get activeEmployees(): number {
    return this.employees.filter((emp: Employee) => emp.active).length;
  }

  /**
   * Count of managerial / leadership personnel.
   */
  get managerEmployees(): number {
    return this.employees.filter((emp: Employee) => 
      emp.role.toLowerCase().includes('manager') || 
      emp.role.toLowerCase().includes('lead')
    ).length;
  }

  /**
   * Count of unique departments within the company.
   */
  get departmentCount(): number {
    const departments = new Set(this.employees.map((emp: Employee) => emp.department));
    return departments.size;
  }

  // ==========================================
  // Event Handlers
  // ==========================================

  /**
   * Requirement 8: Click event handler to select an employee
   * @param employee The employee record clicked by user
   */
  selectEmployee(employee: Employee): void {
    this.selectedEmployee = employee;
  }

  /**
   * Deselect the currently active employee
   */
  clearSelectedEmployee(): void {
    this.selectedEmployee = null;
    this.isDetailModalOpen = false;
  }

  /**
   * Clear the search filter text box
   */
  clearSearch(): void {
    this.searchText = '';
  }

  /**
   * Action trigger enabled by the [disabled]="!selectedEmployee" button
   */
  openDetailsModal(): void {
    if (this.selectedEmployee) {
      this.isDetailModalOpen = true;
    }
  }

  /**
   * Close details modal dialog
   */
  closeDetailsModal(): void {
    this.isDetailModalOpen = false;
  }
}
