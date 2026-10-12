import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { EmployeeService } from '../../core/services/employee.service';
import { AuthService } from '../../core/services/auth.service';
import { SimulationService } from '../../core/services/simulation.service';
import { NotificationService } from '../../core/services/notification.service';
import { Employee } from '../../core/models/employee.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  isLoading = true;
  totalEmployees = 0;
  activeCount = 0;
  totalPayroll = 0;
  avgSalary = 0;
  managerCount = 0;
  departmentCounts: Record<string, number> = {};
  deptKeys: string[] = [];
  errorMessage: string | null = null;

  constructor(
    public employeeService: EmployeeService,
    public authService: AuthService,
    public simulationService: SimulationService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.fetchMetrics();
  }

  fetchMetrics(): void {
    this.isLoading = true;
    this.errorMessage = null;

    this.employeeService.getEmployees({ pageSize: 100 }).subscribe({
      next: res => {
        const list = res.items;
        this.totalEmployees = res.total;
        this.activeCount = list.filter(e => e.active).length;
        this.totalPayroll = list.reduce((sum, e) => sum + e.salary, 0);
        this.avgSalary = this.totalEmployees > 0 ? Math.round(this.totalPayroll / this.totalEmployees) : 0;
        this.managerCount = list.filter(e => e.isManager).length;

        const counts: Record<string, number> = {};
        for (const emp of list) {
          counts[emp.department] = (counts[emp.department] || 0) + 1;
        }
        this.departmentCounts = counts;
        this.deptKeys = Object.keys(counts);
        this.isLoading = false;
      },
      error: err => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'Failed to load workforce metrics from API.';
      }
    });
  }

  getDeptPercent(count: number): number {
    if (!this.totalEmployees) return 0;
    return Math.round((count / this.totalEmployees) * 100);
  }

  // ----------------------------------------------------
  // Step 5 Failure Scenario Triggers
  // ----------------------------------------------------
  testOfflineToggle(): void {
    const isOffline = this.simulationService.toggleOffline();
    if (isOffline) {
      this.notificationService.warning('Offline Mode Active', 'Outgoing HTTP calls will now simulate network disconnection.');
    } else {
      this.notificationService.info('Network Restored', 'Normal online connectivity re-enabled.');
    }
  }

  testExpireAccessToken(): void {
    this.simulationService.corruptAccessToken();
    this.notificationService.warning(
      'Token Expired Manually',
      'Now perform any operation or refresh page to watch AuthInterceptor automatically invoke /api/auth/refresh!'
    );
  }

  testInvalidateRefreshToken(): void {
    this.simulationService.corruptRefreshToken();
    this.notificationService.warning(
      'Refresh Token Corrupted',
      'Corrupted refresh token in storage. When token expires or refresh is triggered, session will end.'
    );
  }

  testTrigger500(): void {
    this.employeeService.testServerError().subscribe({
      error: () => {} // error handled by interceptor
    });
  }

  testNonExistent404(): void {
    this.employeeService.testNonExistentEmployee().subscribe({
      error: () => {} // error handled by interceptor
    });
  }
}
