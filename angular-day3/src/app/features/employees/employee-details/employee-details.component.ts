import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Employee } from '../../../core/models/employee.model';
import { EmployeeService } from '../../../core/services/employee.service';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-employee-details',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './employee-details.component.html',
  styleUrls: ['./employee-details.component.css']
})
export class EmployeeDetailsComponent implements OnInit {
  employee?: Employee;
  resolverUsed: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private employeeService: EmployeeService,
    public authService: AuthService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    // 1. First check if data was resolved via EmployeeResolver
    this.route.data.subscribe(data => {
      if (data['employee']) {
        this.employee = data['employee'];
        this.resolverUsed = true;
      } else {
        // Fallback: manually fetch from service via paramMap
        const id = Number(this.route.snapshot.paramMap.get('id'));
        if (id) {
          this.employee = this.employeeService.getEmployeeById(id);
        }
      }
    });
  }

  toggleStatus(): void {
    if (!this.employee) return;
    this.employeeService.toggleActiveStatus(this.employee.id);
    this.employee = this.employeeService.getEmployeeById(this.employee.id);
    this.notificationService.info(
      'Status Changed',
      `Employee status set to ${this.employee?.active ? 'Active' : 'Inactive'}.`
    );
  }

  deleteProfile(): void {
    if (!this.employee) return;
    if (!this.authService.isAdmin()) {
      this.notificationService.error('Unauthorized', 'Admin permissions required to delete.');
      return;
    }

    if (confirm(`Confirm deletion of ${this.employee.name}?`)) {
      this.employeeService.deleteEmployee(this.employee.id);
      this.notificationService.success('Employee Deleted', `${this.employee.name} was removed.`);
      this.router.navigate(['/employees']);
    }
  }
}
