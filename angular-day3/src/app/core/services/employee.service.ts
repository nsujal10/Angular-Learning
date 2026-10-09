import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { Employee, EmployeeFilterQuery, Department } from '../models/employee.model';

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {
  private employees: Employee[] = [
    {
      id: 1,
      name: 'Sujal Nage',
      email: 'sujal@spikeoffice.io',
      department: 'Engineering',
      role: 'Senior Full Stack Developer',
      salary: 115000,
      active: true,
      joinDate: '2023-01-15',
      skills: ['Angular', 'TypeScript', 'Node.js', 'RxJS', 'Tailwind CSS'],
      isManager: true,
      teamSize: 6,
      managerBonus: 12000,
      phone: '+1 (555) 234-5678',
      notes: 'Lead engineer on platform modernization and component architecture.'
    },
    {
      id: 2,
      name: 'Sarah Connor',
      email: 'sarah.connor@spikeoffice.io',
      department: 'Engineering',
      role: 'VP of Engineering',
      salary: 165000,
      active: true,
      joinDate: '2021-03-01',
      skills: ['Architecture', 'System Design', 'Leadership', 'Cloud Infrastructure'],
      isManager: true,
      teamSize: 24,
      managerBonus: 25000,
      phone: '+1 (555) 345-6789',
      notes: 'Oversees engineering org and technical direction.'
    },
    {
      id: 3,
      name: 'Alex Mercer',
      email: 'alex.mercer@spikeoffice.io',
      department: 'Engineering',
      role: 'Senior Frontend Developer',
      salary: 98000,
      active: true,
      joinDate: '2022-06-10',
      skills: ['Angular', 'RxJS', 'HTML5/SCSS', 'Jest'],
      isManager: false,
      phone: '+1 (555) 456-7890',
      notes: 'UI performance and design systems specialist.'
    },
    {
      id: 4,
      name: 'Elena Rostova',
      email: 'elena.rostova@spikeoffice.io',
      department: 'Design',
      role: 'Lead UI/UX Designer',
      salary: 95000,
      active: true,
      joinDate: '2022-09-18',
      skills: ['Figma', 'Design Systems', 'User Research', 'Prototyping'],
      isManager: true,
      teamSize: 4,
      managerBonus: 8000,
      phone: '+1 (555) 567-8901',
      notes: 'Directs design tokens and SaaS user journey design.'
    },
    {
      id: 5,
      name: 'Marcus Vance',
      email: 'marcus.vance@spikeoffice.io',
      department: 'Product',
      role: 'Principal Product Manager',
      salary: 125000,
      active: true,
      joinDate: '2022-02-11',
      skills: ['Product Strategy', 'Agile', 'Roadmapping', 'Data Analytics'],
      isManager: true,
      teamSize: 5,
      managerBonus: 15000,
      phone: '+1 (555) 678-9012',
      notes: 'Drives SaaS subscription metrics and feature roadmaps.'
    },
    {
      id: 6,
      name: 'Chloe Price',
      email: 'chloe.price@spikeoffice.io',
      department: 'Marketing',
      role: 'Growth Marketing Specialist',
      salary: 76000,
      active: false,
      joinDate: '2023-04-20',
      skills: ['SEO', 'Content Strategy', 'HubSpot', 'Conversion Optimization'],
      isManager: false,
      phone: '+1 (555) 789-0123',
      notes: 'On temporary leave until next quarter.'
    },
    {
      id: 7,
      name: 'David Kim',
      email: 'david.kim@spikeoffice.io',
      department: 'Engineering',
      role: 'Backend Architect',
      salary: 132000,
      active: true,
      joinDate: '2021-11-05',
      skills: ['Go', 'PostgreSQL', 'Docker', 'Kubernetes', 'gRPC'],
      isManager: false,
      phone: '+1 (555) 890-1234',
      notes: 'Core services reliability and distributed caching.'
    },
    {
      id: 8,
      name: 'Amina Al-Mansoor',
      email: 'amina.mansoor@spikeoffice.io',
      department: 'Human Resources',
      role: 'Head of People Operations',
      salary: 105000,
      active: true,
      joinDate: '2020-08-14',
      skills: ['Talent Acquisition', 'Payroll', 'Employee Relations', 'HR Compliance'],
      isManager: true,
      teamSize: 3,
      managerBonus: 10000,
      phone: '+1 (555) 901-2345',
      notes: 'Leads global employee engagement and compensation planning.'
    },
    {
      id: 9,
      name: 'Julian Thorne',
      email: 'julian.thorne@spikeoffice.io',
      department: 'Finance',
      role: 'Senior Financial Analyst',
      salary: 89000,
      active: true,
      joinDate: '2023-08-01',
      skills: ['Financial Modeling', 'Budgeting', 'Excel', 'ERP Systems'],
      isManager: false,
      phone: '+1 (555) 012-3456',
      notes: 'Payroll audits and department budget reconciliation.'
    }
  ];

  private employeesSubject = new BehaviorSubject<Employee[]>(this.employees);
  public employees$ = this.employeesSubject.asObservable();

  getDepartments(): Department[] {
    return ['Engineering', 'Design', 'Product', 'Marketing', 'Human Resources', 'Finance'];
  }

  getEmployees(): Employee[] {
    return [...this.employees];
  }

  getEmployeeById(id: number): Employee | undefined {
    return this.employees.find(e => e.id === id);
  }

  getEmployeeByIdAsync(id: number): Observable<Employee | undefined> {
    return of(this.getEmployeeById(id));
  }

  addEmployee(employeeData: Omit<Employee, 'id'>): Employee {
    const nextId = this.employees.length > 0 ? Math.max(...this.employees.map(e => e.id)) + 1 : 1;
    const newEmployee: Employee = {
      ...employeeData,
      id: nextId
    };
    this.employees = [newEmployee, ...this.employees];
    this.employeesSubject.next(this.employees);
    return newEmployee;
  }

  updateEmployee(id: number, updatedFields: Partial<Employee>): Employee | null {
    const index = this.employees.findIndex(e => e.id === id);
    if (index === -1) return null;

    const updatedEmployee: Employee = {
      ...this.employees[index],
      ...updatedFields,
      id
    };

    this.employees = [
      ...this.employees.slice(0, index),
      updatedEmployee,
      ...this.employees.slice(index + 1)
    ];
    this.employeesSubject.next(this.employees);
    return updatedEmployee;
  }

  deleteEmployee(id: number): boolean {
    const exists = this.employees.some(e => e.id === id);
    if (!exists) return false;
    this.employees = this.employees.filter(e => e.id !== id);
    this.employeesSubject.next(this.employees);
    return true;
  }

  toggleActiveStatus(id: number): boolean {
    const emp = this.employees.find(e => e.id === id);
    if (!emp) return false;
    emp.active = !emp.active;
    this.employeesSubject.next([...this.employees]);
    return true;
  }

  filterEmployees(query: EmployeeFilterQuery): { items: Employee[]; total: number } {
    let list = [...this.employees];

    if (query.search && query.search.trim() !== '') {
      const q = query.search.toLowerCase().trim();
      list = list.filter(
        e =>
          e.name.toLowerCase().includes(q) ||
          e.email.toLowerCase().includes(q) ||
          e.role.toLowerCase().includes(q) ||
          e.skills.some(s => s.toLowerCase().includes(q))
      );
    }

    if (query.department && query.department !== 'All') {
      list = list.filter(e => e.department === query.department);
    }

    if (query.status && query.status !== 'all') {
      const wantActive = query.status === 'active';
      list = list.filter(e => e.active === wantActive);
    }

    if (query.sortBy) {
      const order = query.sortOrder === 'desc' ? -1 : 1;
      list.sort((a, b) => {
        if (query.sortBy === 'salary') {
          return (a.salary - b.salary) * order;
        } else if (query.sortBy === 'name') {
          return a.name.localeCompare(b.name) * order;
        } else if (query.sortBy === 'department') {
          return a.department.localeCompare(b.department) * order;
        }
        return 0;
      });
    }

    const total = list.length;
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 5;
    const start = (page - 1) * pageSize;
    const items = list.slice(start, start + pageSize);

    return { items, total };
  }

  getDashboardStats() {
    const total = this.employees.length;
    const active = this.employees.filter(e => e.active).length;
    const inactive = total - active;
    const totalPayroll = this.employees.reduce((sum, e) => sum + e.salary, 0);
    const avgSalary = total > 0 ? Math.round(totalPayroll / total) : 0;
    const managers = this.employees.filter(e => e.isManager).length;

    const departmentCounts: Record<string, number> = {};
    for (const e of this.employees) {
      departmentCounts[e.department] = (departmentCounts[e.department] || 0) + 1;
    }

    return {
      total,
      active,
      inactive,
      totalPayroll,
      avgSalary,
      managers,
      departmentCounts
    };
  }
}
