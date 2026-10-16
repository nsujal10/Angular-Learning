import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { EmployeeApiService } from '../../employees/data-access/employee-api.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatTableModule,
    MatTooltipModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  employeeApi = inject(EmployeeApiService);

  recentHiresColumns: string[] = ['name', 'department', 'role', 'status', 'actions'];

  ngOnInit(): void {
    this.loadStats();
  }

  loadStats(): void {
    this.employeeApi.getDashboardStats().subscribe();
    this.employeeApi.getEmployees().subscribe();
  }

  getDepartmentPercentage(count: number, total: number): number {
    if (!total) return 0;
    return Math.round((count / total) * 100);
  }

  getDepartmentEntries(dict?: Record<string, number>): { department: string; count: number }[] {
    if (!dict) return [];
    return Object.entries(dict).map(([department, count]) => ({ department, count }));
  }
}
