import { ChangeDetectionStrategy, Component, Input, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Department, DepartmentMetrics, Employee } from '../../../../core/models/employee.model';

@Component({
  selector: 'app-analytics-panel',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './analytics-panel.component.html',
  styleUrls: ['./analytics-panel.component.scss']
})
export class AnalyticsPanelComponent {
  private readonly _employees = signal<Employee[]>([]);

  @Input({ required: true })
  set employees(value: Employee[]) {
    this._employees.set(value || []);
  }

  get employees(): Employee[] {
    return this._employees();
  }

  // Computed department analytics derived reactively
  readonly departmentMetrics = computed<DepartmentMetrics[]>(() => {
    const list = this._employees();
    if (list.length === 0) return [];

    const depts: Department[] = ['Engineering', 'Design', 'Product', 'Marketing', 'Human Resources', 'Finance'];

    return depts.map(dept => {
      const deptEmployees = list.filter(e => e.department === dept);
      const headcount = deptEmployees.length;
      const totalSalary = deptEmployees.reduce((sum, e) => sum + e.salary, 0);
      const averageSalary = headcount > 0 ? Math.round(totalSalary / headcount) : 0;
      const activeCount = deptEmployees.filter(e => e.status === 'Active').length;
      const activeRate = headcount > 0 ? Math.round((activeCount / headcount) * 100) : 0;

      return {
        department: dept,
        headcount,
        totalSalary,
        averageSalary,
        activeRate
      };
    }).filter(d => d.headcount > 0);
  });

  readonly topDepartment = computed(() => {
    const metrics = this.departmentMetrics();
    if (metrics.length === 0) return null;
    return [...metrics].sort((a, b) => b.headcount - a.headcount)[0];
  });

  readonly highestAvgSalaryDept = computed(() => {
    const metrics = this.departmentMetrics();
    if (metrics.length === 0) return null;
    return [...metrics].sort((a, b) => b.averageSalary - a.averageSalary)[0];
  });

  readonly totalPayroll = computed(() => {
    return this._employees().reduce((acc, curr) => acc + curr.salary, 0);
  });

  readonly averageScore = computed(() => {
    const list = this._employees();
    if (list.length === 0) return 0;
    const total = list.reduce((acc, curr) => acc + curr.performanceScore, 0);
    return (total / list.length).toFixed(1);
  });
}
