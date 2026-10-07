/**
 * Model definition for an Employee entity.
 * Represents standard employee data used throughout the dashboard.
 */
export interface Employee {
  id: number;
  name: string;
  email: string;
  department: string;
  role: string;
  salary: number;
  active: boolean;
}

/**
 * Mock data: At least 10 realistic employees across different departments and roles.
 * Includes both active and inactive members, as well as several managers.
 */
export const INITIAL_EMPLOYEES: Employee[] = [
  {
    id: 1,
    name: 'Sarah Connor',
    email: 'sarah.connor@cyberdyne.io',
    department: 'Engineering',
    role: 'Engineering Manager',
    salary: 135000,
    active: true
  },
  {
    id: 2,
    name: 'Alex Mercer',
    email: 'alex.mercer@innovate.tech',
    department: 'Engineering',
    role: 'Senior Frontend Developer',
    salary: 98000,
    active: true
  },
  {
    id: 3,
    name: 'Elena Rostova',
    email: 'elena.rostova@designworks.com',
    department: 'Design',
    role: 'Lead UI/UX Designer',
    salary: 92000,
    active: true
  },
  {
    id: 4,
    name: 'Marcus Vance',
    email: 'marcus.vance@innovate.tech',
    department: 'Product',
    role: 'Product Manager',
    salary: 115000,
    active: true
  },
  {
    id: 5,
    name: 'Chloe Price',
    email: 'chloe.price@arcadia.net',
    department: 'Marketing',
    role: 'Growth Marketing Specialist',
    salary: 74000,
    active: false
  },
  {
    id: 6,
    name: 'David Kim',
    email: 'david.kim@innovate.tech',
    department: 'Engineering',
    role: 'Backend Architect',
    salary: 122000,
    active: true
  },
  {
    id: 7,
    name: 'Amina Al-Mansoor',
    email: 'amina.mansoor@hrplus.org',
    department: 'Human Resources',
    role: 'HR Operations Manager',
    salary: 88000,
    active: true
  },
  {
    id: 8,
    name: 'Liam Gallagher',
    email: 'liam.gallagher@innovate.tech',
    department: 'Finance',
    role: 'Financial Analyst',
    salary: 81000,
    active: false
  },
  {
    id: 9,
    name: 'Priya Sharma',
    email: 'priya.sharma@innovate.tech',
    department: 'Engineering',
    role: 'QA Automation Engineer',
    salary: 79000,
    active: true
  },
  {
    id: 10,
    name: 'Jonathan Hastings',
    email: 'jonathan.h@designworks.com',
    department: 'Design',
    role: 'Visual Design Specialist',
    salary: 76000,
    active: true
  },
  {
    id: 11,
    name: 'Rachel Zane',
    email: 'rachel.zane@legaldept.corp',
    department: 'Legal',
    role: 'Legal Counsel & Compliance Manager',
    salary: 128000,
    active: true
  },
  {
    id: 12,
    name: 'Carlos Mendoza',
    email: 'carlos.mendoza@innovate.tech',
    department: 'DevOps',
    role: 'Site Reliability Engineer',
    salary: 105000,
    active: false
  }
];
