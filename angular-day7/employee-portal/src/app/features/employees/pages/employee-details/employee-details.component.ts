import { Component, Input, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Employee } from '../../../../core/models/employee.model';
import { EmployeeApiService } from '../../data-access/employee-api.service';

@Component({
  selector: 'app-employee-details',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatDividerModule,
    MatTooltipModule,
    MatSnackBarModule
  ],
  templateUrl: './employee-details.component.html',
  styleUrl: './employee-details.component.scss'
})
export class EmployeeDetailsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private employeeApi = inject(EmployeeApiService);
  private snackBar = inject(MatSnackBar);

  // Directly populated by route resolver
  @Input() employee?: Employee;

  employeeData = signal<Employee | null>(null);

  ngOnInit(): void {
    if (this.employee) {
      this.employeeData.set(this.employee);
    } else {
      this.route.data.subscribe(data => {
        if (data['employee']) {
          this.employeeData.set(data['employee']);
        }
      });
    }
  }

  deleteEmployee(): void {
    const emp = this.employeeData();
    if (!emp) return;

    const confirmed = confirm(`Are you sure you want to delete ${emp.firstName} ${emp.lastName}?`);
    if (confirmed) {
      this.employeeApi.deleteEmployee(emp.id).subscribe({
        next: () => {
          this.snackBar.open('Employee record removed.', 'Dismiss', { duration: 3000 });
          this.router.navigate(['/employees']);
        }
      });
    }
  }
}
