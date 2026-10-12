import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { EmployeeService } from '../../../core/services/employee.service';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Employee } from '../../../core/models/employee.model';

@Component({
  selector: 'app-employee-details',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './employee-details.component.html',
  styleUrls: ['./employee-details.component.css']
})
export class EmployeeDetailsComponent implements OnInit {
  employee?: Employee;
  isLoading = true;
  errorMessage: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private employeeService: EmployeeService,
    public authService: AuthService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id || isNaN(id)) {
      this.errorMessage = 'Invalid Employee Identifier';
      this.isLoading = false;
      return;
    }

    this.fetchEmployee(id);
  }

  fetchEmployee(id: number): void {
    this.isLoading = true;
    this.errorMessage = null;

    this.employeeService.getEmployeeById(id).subscribe({
      next: emp => {
        this.employee = emp;
        this.isLoading = false;
      },
      error: err => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || `Employee #${id} could not be retrieved from backend.`;
      }
    });
  }

  toggleStatus(): void {
    if (!this.employee) return;
    const newStatus = !this.employee.active;
    this.employeeService.updateEmployee(this.employee.id, { active: newStatus }).subscribe({
      next: updated => {
        if (this.employee) this.employee.active = updated.active;
        this.notificationService.info(
          'Status Changed',
          `Employee status set to ${updated.active ? 'Active' : 'Inactive'}.`
        );
      }
    });
  }

  deleteProfile(): void {
    if (!this.employee) return;

    if (!confirm(`Permanently remove ${this.employee.name} from the portal?`)) {
      return;
    }

    this.employeeService.deleteEmployee(this.employee.id).subscribe({
      next: () => {
        this.notificationService.success('Record Removed', 'Employee was successfully deleted.');
        this.router.navigate(['/employees']);
      },
      error: () => {
        // Interceptor alerts 403 Forbidden if non-admin
      }
    });
  }
}
