import { Injectable } from '@angular/core';
import { Employee } from '../models/employee.model';

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {
  private employees: Employee[] = [
    {
      id: 1,
      name: 'Sujal',
      email: 'sujal@example.com',
      department: 'Engineering',
      role: 'Developer',
      salary: 50000,
      active: true
    },
    {
      id: 2,
      name: 'Sarah Connor',
      email: 'sarah.connor@cyberdyne.io',
      department: 'Engineering',
      role: 'Engineering Manager',
      salary: 135000,
      active: true
    },
    {
      id: 3,
      name: 'Alex Mercer',
      email: 'alex.mercer@innovate.tech',
      department: 'Engineering',
      role: 'Senior Frontend Developer',
      salary: 98000,
      active: true
    },
    {
      id: 4,
      name: 'Elena Rostova',
      email: 'elena.rostova@designworks.com',
      department: 'Design',
      role: 'Lead UI/UX Designer',
      salary: 92000,
      active: true
    },
    {
      id: 5,
      name: 'Marcus Vance',
      email: 'marcus.vance@innovate.tech',
      department: 'Product',
      role: 'Product Manager',
      salary: 115000,
      active: true
    },
    {
      id: 6,
      name: 'Chloe Price',
      email: 'chloe.price@arcadia.net',
      department: 'Marketing',
      role: 'Growth Marketing Specialist',
      salary: 74000,
      active: false
    },
    {
      id: 7,
      name: 'David Kim',
      email: 'david.kim@innovate.tech',
      department: 'Engineering',
      role: 'Backend Architect',
      salary: 122000,
      active: true
    },
    {
      id: 8,
      name: 'Amina Al-Mansoor',
      email: 'amina.mansoor@hrplus.org',
      department: 'Human Resources',
      role: 'HR Operations Manager',
      salary: 88000,
      active: true
    }
  ];

  getEmployees(): Employee[] {
    return [...this.employees];
  }

  getEmployeeById(id: number): Employee | undefined {
    return this.employees.find(e => e.id === id);
  }

  addEmployee(employee: Omit<Employee, 'id'>): Employee {
    const nextId = this.employees.length > 0 ? Math.max(...this.employees.map(e => e.id)) + 1 : 1;
    const newEmployee: Employee = {
      ...employee,
      id: nextId
    };
    this.employees = [newEmployee, ...this.employees];
    return newEmployee;
  }

  removeEmployee(id: number): void {
    this.employees = this.employees.filter(e => e.id !== id);
  }

  toggleActiveStatus(id: number): void {
    const target = this.employees.find(e => e.id === id);
    if (target) {
      target.active = !target.active;
    }
  }
}
