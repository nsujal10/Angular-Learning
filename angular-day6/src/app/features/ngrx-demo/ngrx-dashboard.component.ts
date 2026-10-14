import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { CreateEmployeeDto, Employee } from '../../core/models/employee.model';
import { EmployeeApiService } from '../../core/services/employee-api.service';
import * as EmployeeActions from '../../state/employee.actions';
import {
  selectAllEmployees,
  selectEmployeeCount,
  selectEmployeesError,
  selectEmployeesLoading,
  selectFilterQuery,
  selectFilteredEmployees,
  selectLastAction,
  selectSelectedEmployee
} from '../../state/employee.selectors';

@Component({
  selector: 'app-ngrx-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ngrx-dashboard.component.html',
  styleUrl: './ngrx-dashboard.component.css'
})
export class NgrxDashboardComponent {
  private readonly store = inject(Store);
  private readonly apiService = inject(EmployeeApiService);

  // NgRx Selectors
  readonly employees$ = this.store.select(selectAllEmployees);
  readonly filteredEmployees$ = this.store.select(selectFilteredEmployees);
  readonly loading$ = this.store.select(selectEmployeesLoading);
  readonly error$ = this.store.select(selectEmployeesError);
  readonly employeeCount$ = this.store.select(selectEmployeeCount);
  readonly selectedEmployee$ = this.store.select(selectSelectedEmployee);
  readonly lastAction$ = this.store.select(selectLastAction);
  readonly filterQuery$ = this.store.select(selectFilterQuery);

  onFilterChange(query: string): void {
    this.store.dispatch(EmployeeActions.setFilterQuery({ query }));
  }

  dispatchLoad(): void {
    this.apiService.setSimulateFailure(false);
    this.store.dispatch(EmployeeActions.loadEmployees());
  }

  dispatchTriggerError(): void {
    // Force API to fail to demonstrate effect failure action and error state
    this.apiService.setSimulateFailure(true);
    this.store.dispatch(EmployeeActions.loadEmployees());
  }

  dispatchClearError(): void {
    this.apiService.setSimulateFailure(false);
    this.store.dispatch(EmployeeActions.clearError());
  }

  dispatchCreateSample(): void {
    this.apiService.setSimulateFailure(false);
    const sample: CreateEmployeeDto = {
      name: 'Jordan Miller',
      email: `jordan.m.${Date.now().toString().slice(-4)}@cyberdyne.dev`,
      role: 'Staff ML Engineer',
      department: 'Engineering',
      status: 'Active',
      salary: 175000,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      performanceScore: 97,
      joinDate: new Date().toISOString().split('T')[0],
      skills: ['PyTorch', 'TensorRT', 'Angular', 'CUDA']
    };

    this.store.dispatch(EmployeeActions.createEmployee({ employee: sample }));
  }

  dispatchSelect(id: number): void {
    this.store.dispatch(EmployeeActions.selectEmployee({ id }));
  }

  dispatchDelete(id: number, event: MouseEvent): void {
    event.stopPropagation();
    this.apiService.setSimulateFailure(false);
    this.store.dispatch(EmployeeActions.deleteEmployee({ id }));
  }

  dispatchReset(): void {
    this.apiService.setSimulateFailure(false);
    this.store.dispatch(EmployeeActions.resetEmployeeState());
  }
}
