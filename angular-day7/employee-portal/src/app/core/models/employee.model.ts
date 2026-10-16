export interface Employee {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  department: string;
  role: string;
  salary: number;
  joiningDate: string | Date;
  status: 'Active' | 'OnLeave' | 'Terminated';
  performanceScore: number;
  avatar?: string;
  bio?: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface CreateEmployeeRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  department: string;
  role: string;
  salary: number;
  joiningDate: string | Date;
  status: string;
  performanceScore: number;
  bio?: string;
}

export interface UpdateEmployeeRequest extends CreateEmployeeRequest {
  id: number;
}

export interface DashboardStats {
  totalEmployees: number;
  activeEmployees: number;
  onLeaveEmployees: number;
  totalPayroll: number;
  averageSalary: number;
  averagePerformance: number;
  departmentDistribution: Record<string, number>;
  statusDistribution: Record<string, number>;
  recentHires: RecentHire[];
}

export interface RecentHire {
  id: number;
  name: string;
  role: string;
  department: string;
  joiningDate: string | Date;
  status: string;
}
