import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Employee, Department } from '../../core/models/employee.model';
import { EmployeeService } from '../../core/services/employee.service';

interface DepartmentReport {
  department: Department;
  headcount: number;
  totalBudget: number;
  avgSalary: number;
  minSalary: number;
  maxSalary: number;
  activeRatio: number;
}

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss']
})
export class ReportsComponent implements OnInit {
  private readonly employeeService = inject(EmployeeService);

  readonly employees = signal<Employee[]>([]);
  readonly isExporting = signal<boolean>(false);
  readonly exportMessage = signal<string | null>(null);

  readonly departmentReports = computed<DepartmentReport[]>(() => {
    const list = this.employees();
    if (list.length === 0) return [];

    const depts: Department[] = ['Engineering', 'Design', 'Product', 'Marketing', 'Human Resources', 'Finance'];

    return depts.map((d) => {
      const deptMembers = list.filter((e) => e.department === d);
      const headcount = deptMembers.length;
      if (headcount === 0) {
        return {
          department: d,
          headcount: 0,
          totalBudget: 0,
          avgSalary: 0,
          minSalary: 0,
          maxSalary: 0,
          activeRatio: 0
        };
      }

      const totalBudget = deptMembers.reduce((sum, e) => sum + e.salary, 0);
      const salaries = deptMembers.map((e) => e.salary);
      const minSalary = Math.min(...salaries);
      const maxSalary = Math.max(...salaries);
      const avgSalary = Math.round(totalBudget / headcount);
      const activeMembers = deptMembers.filter((e) => e.status === 'Active').length;
      const activeRatio = Math.round((activeMembers / headcount) * 100);

      return {
        department: d,
        headcount,
        totalBudget,
        avgSalary,
        minSalary,
        maxSalary,
        activeRatio
      };
    }).filter(r => r.headcount > 0);
  });

  readonly totalBudget = computed(() =>
    this.employees().reduce((sum, e) => sum + e.salary, 0)
  );

  readonly averageCompanySalary = computed(() => {
    const count = this.employees().length;
    return count > 0 ? Math.round(this.totalBudget() / count) : 0;
  });

  readonly totalActiveRate = computed(() => {
    const total = this.employees().length;
    if (total === 0) return 0;
    const active = this.employees().filter((e) => e.status === 'Active').length;
    return Math.round((active / total) * 100);
  });

  ngOnInit(): void {
    this.employeeService.getEmployees().subscribe({
      next: (data) => this.employees.set(data),
      error: () => this.employees.set(this.employeeService.getInitialSeedEmployees())
    });
  }

  exportReportCsv(): void {
    this.isExporting.set(true);

    const headers = ['Department', 'Headcount', 'AvgSalary', 'MinSalary', 'MaxSalary', 'TotalBudget', 'ActiveRatio'];
    const rows = this.departmentReports().map((r) => [
      r.department,
      r.headcount,
      r.avgSalary,
      r.minSalary,
      r.maxSalary,
      r.totalBudget,
      `${r.activeRatio}%`
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `workforce-report-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    this.isExporting.set(false);
    this.exportMessage.set('Report exported successfully to CSV!');
    setTimeout(() => this.exportMessage.set(null), 3000);
  }
}
