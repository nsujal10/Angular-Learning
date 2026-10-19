export interface Employee {
  id: string;
  fullName: string;
  email: string;
  department: string;
  role: string;
  salary: number;
  hireDate: string;
  bio?: string;
  status: 'Active' | 'On Leave' | 'Terminated';
}

export type DepartmentType =
  | 'Engineering'
  | 'Information Security'
  | 'Product & Design'
  | 'Human Resources'
  | 'Finance & Accounting';

export const DEPARTMENTS: DepartmentType[] = [
  'Engineering',
  'Information Security',
  'Product & Design',
  'Human Resources',
  'Finance & Accounting'
];
