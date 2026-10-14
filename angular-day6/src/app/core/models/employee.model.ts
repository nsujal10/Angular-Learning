export type Department = 'Engineering' | 'Design' | 'Product' | 'Marketing' | 'Operations';
export type EmployeeStatus = 'Active' | 'On Leave' | 'Terminated';

export interface Employee {
  id: number;
  name: string;
  email: string;
  role: string;
  department: Department;
  status: EmployeeStatus;
  salary: number;
  avatar: string;
  performanceScore: number;
  joinDate: string;
  skills: string[];
}

export type CreateEmployeeDto = Omit<Employee, 'id'>;
export type UpdateEmployeeDto = Partial<CreateEmployeeDto>;

export const INITIAL_EMPLOYEES: Employee[] = [
  {
    id: 1,
    name: 'Sarah Connor',
    email: 'sarah.connor@cyberdyne.dev',
    role: 'Principal Systems Architect',
    department: 'Engineering',
    status: 'Active',
    salary: 165000,
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    performanceScore: 98,
    joinDate: '2021-03-15',
    skills: ['Angular', 'TypeScript', 'RxJS', 'NgRx', 'Distributed Systems']
  },
  {
    id: 2,
    name: 'Marcus Vance',
    email: 'marcus.vance@cyberdyne.dev',
    role: 'Lead UX/UI Designer',
    department: 'Design',
    status: 'Active',
    salary: 140000,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    performanceScore: 94,
    joinDate: '2022-01-10',
    skills: ['Figma', 'Design Systems', 'Micro-interactions', 'CSS Architecture']
  },
  {
    id: 3,
    name: 'Elena Rostova',
    email: 'elena.rostova@cyberdyne.dev',
    role: 'Senior Frontend Engineer',
    department: 'Engineering',
    status: 'Active',
    salary: 135000,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    performanceScore: 91,
    joinDate: '2022-06-20',
    skills: ['Angular Signals', 'RxJS', 'WebSockets', 'Tailwind']
  },
  {
    id: 4,
    name: 'David Kim',
    email: 'david.kim@cyberdyne.dev',
    role: 'Group Product Manager',
    department: 'Product',
    status: 'Active',
    salary: 152000,
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    performanceScore: 96,
    joinDate: '2021-11-01',
    skills: ['Product Strategy', 'Roadmapping', 'Agile', 'User Analytics']
  },
  {
    id: 5,
    name: 'Aisha Patel',
    email: 'aisha.patel@cyberdyne.dev',
    role: 'Staff DevOps & Cloud Specialist',
    department: 'Operations',
    status: 'On Leave',
    salary: 148000,
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    performanceScore: 89,
    joinDate: '2020-08-14',
    skills: ['Kubernetes', 'CI/CD', 'Terraform', 'AWS', 'Grafana']
  },
  {
    id: 6,
    name: 'Lucas Wright',
    email: 'lucas.wright@cyberdyne.dev',
    role: 'Growth Marketing Director',
    department: 'Marketing',
    status: 'Active',
    salary: 128000,
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    performanceScore: 87,
    joinDate: '2023-02-17',
    skills: ['Performance Marketing', 'SEO/SEM', 'Brand Growth', 'Data Storytelling']
  }
];
