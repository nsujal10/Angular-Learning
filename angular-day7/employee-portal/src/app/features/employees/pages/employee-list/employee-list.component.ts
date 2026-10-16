import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { EmployeeApiService } from '../../data-access/employee-api.service';
import { Employee } from '../../../../core/models/employee.model';

@Component({
  selector: 'app-employee-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    MatTableModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatSnackBarModule
  ],
  templateUrl: './employee-list.component.html',
  styleUrl: './employee-list.component.scss'
})
export class EmployeeListComponent implements OnInit {
  employeeApi = inject(EmployeeApiService);
  private snackBar = inject(MatSnackBar);

  searchControl = new FormControl('');
  selectedDepartment = signal<string>('All');
  selectedStatus = signal<string>('All');

  displayedColumns: string[] = [
    'employee',
    'department',
    'role',
    'salary',
    'status',
    'performance',
    'actions'
  ];

  departmentList = [
    'All',
    'Engineering',
    'Design',
    'Product',
    'HR',
    'Finance',
    'Marketing'
  ];

  statusList = ['All', 'Active', 'OnLeave', 'Terminated'];

  ngOnInit(): void {
    this.loadEmployees();

    this.searchControl.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe(() => {
        this.loadEmployees();
      });
  }

  loadEmployees(): void {
    const search = this.searchControl.value || '';
    const dept = this.selectedDepartment();
    const status = this.selectedStatus();

    this.employeeApi.getEmployees(search, dept, status).subscribe();
  }

  onDepartmentChange(dept: string): void {
    this.selectedDepartment.set(dept);
    this.loadEmployees();
  }

  onStatusChange(status: string): void {
    this.selectedStatus.set(status);
    this.loadEmployees();
  }

  resetFilters(): void {
    this.searchControl.setValue('');
    this.selectedDepartment.set('All');
    this.selectedStatus.set('All');
    this.loadEmployees();
  }

  deleteEmployee(employee: Employee, event: Event): void {
    event.stopPropagation();
    const confirmed = confirm(
      `Are you sure you want to remove ${employee.firstName} ${employee.lastName} from the organization?`
    );

    if (confirmed) {
      this.employeeApi.deleteEmployee(employee.id).subscribe({
        next: () => {
          this.snackBar.open(
            `${employee.firstName} ${employee.lastName} was deleted successfully.`,
            'Dismiss',
            { duration: 4000 }
          );
        },
        error: () => {
          this.snackBar.open('Failed to delete employee. Please try again.', 'Close', {
            duration: 4000
          });
        }
      });
    }
  }
}
