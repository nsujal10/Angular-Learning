export type Department =
  | 'Engineering'
  | 'Design'
  | 'Product'
  | 'Marketing'
  | 'Human Resources'
  | 'Finance';

export interface Employee {
  id: number;
  name: string;
  email: string;
  department: Department;
  role: string;
  salary: number;
  active: boolean;
  joinDate: string;
  skills: string[];
  isManager?: boolean;
  teamSize?: number;
  managerBonus?: number;
  phone?: string;
  notes?: string;
}

export interface EmployeeFilterQuery {
  search?: string;
  department?: string;
  status?: 'all' | 'active' | 'inactive';
  sortBy?: 'name' | 'salary' | 'department';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}
