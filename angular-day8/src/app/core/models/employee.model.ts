export interface Employee {
  id: number;
  name: string;
  email: string;
  role: string;
  department: Department;
  salary: number;
  status: EmployeeStatus;
  location: string;
  joinedDate: string;
  performanceScore: number; // 1-5 scale
}

export type Department =
  | 'Engineering'
  | 'Design'
  | 'Product'
  | 'Marketing'
  | 'Human Resources'
  | 'Finance';

export type EmployeeStatus = 'Active' | 'Inactive' | 'On Leave';

export interface DepartmentMetrics {
  department: Department;
  headcount: number;
  totalSalary: number;
  averageSalary: number;
  activeRate: number;
}

export interface DashboardSummary {
  totalEmployees: number;
  activeEmployees: number;
  onLeaveEmployees: number;
  inactiveEmployees: number;
  averageSalary: number;
  totalPayroll: number;
}
