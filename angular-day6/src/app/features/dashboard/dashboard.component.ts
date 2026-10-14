import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Employee } from '../../core/models/employee.model';
import { EmployeeStateService } from '../../core/services/employee-state.service';
import { EmployeeDetailComponent } from '../employees/employee-detail/employee-detail.component';
import { EmployeeFormComponent } from '../employees/employee-form/employee-form.component';
import { EmployeeListComponent } from '../employees/employee-list/employee-list.component';
import { EmployeeSearchComponent } from '../employees/employee-search/employee-search.component';
import { NgrxDashboardComponent } from '../ngrx-demo/ngrx-dashboard.component';

export type DashboardTab = 'signals' | 'rxjs' | 'ngrx' | 'checklist';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    EmployeeListComponent,
    EmployeeDetailComponent,
    EmployeeFormComponent,
    EmployeeSearchComponent,
    NgrxDashboardComponent
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {
  readonly state = inject(EmployeeStateService);

  activeTab: DashboardTab = 'signals';
  showFormModal = false;
  employeeToEdit: Employee | null = null;

  openCreateModal(): void {
    this.employeeToEdit = null;
    this.showFormModal = true;
  }

  openEditModal(employee: Employee): void {
    this.employeeToEdit = employee;
    this.showFormModal = true;
  }

  closeModal(): void {
    this.showFormModal = false;
    this.employeeToEdit = null;
  }

  setTab(tab: DashboardTab): void {
    this.activeTab = tab;
  }

  toggleTheme(): void {
    this.state.toggleTheme();
  }

  resetAll(): void {
    if (confirm('Reset all demo state to initial defaults?')) {
      this.state.resetState();
    }
  }
}
