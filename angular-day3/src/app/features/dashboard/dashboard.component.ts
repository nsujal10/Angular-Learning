import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { EmployeeService } from '../../core/services/employee.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  stats: any = null;
  departments: string[] = [];

  constructor(
    public employeeService: EmployeeService,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    this.refreshStats();
  }

  refreshStats(): void {
    this.stats = this.employeeService.getDashboardStats();
    this.departments = Object.keys(this.stats.departmentCounts);
  }

  getDepartmentPercentage(count: number): number {
    if (!this.stats || this.stats.total === 0) return 0;
    return Math.round((count / this.stats.total) * 100);
  }
}
