import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { EmployeeService } from './employee.service';
import { Employee } from '../models/employee.model';

describe('EmployeeService (API Integration)', () => {
  let service: EmployeeService;
  let httpTestingController: HttpTestingController;

  const mockEmployees: Employee[] = [
    {
      id: 101,
      name: 'Sarah Connor',
      email: 'sarah.connor@enterprise.io',
      role: 'Principal Cloud Architect',
      department: 'Engineering',
      salary: 145000,
      status: 'Active',
      location: 'San Francisco, CA',
      joinedDate: '2021-03-15',
      performanceScore: 4.9
    },
    {
      id: 102,
      name: 'Marcus Vance',
      email: 'marcus.vance@enterprise.io',
      role: 'Lead UX/UI Designer',
      department: 'Design',
      salary: 118000,
      status: 'Active',
      location: 'Austin, TX',
      joinedDate: '2022-01-10',
      performanceScore: 4.7
    }
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        EmployeeService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });

    service = TestBed.inject(EmployeeService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('GET /api/employees', () => {
    it('should retrieve all employees via GET request', () => {
      service.getEmployees().subscribe((employees) => {
        expect(employees.length).toBe(2);
        expect(employees).toEqual(mockEmployees);
        expect(employees[0].name).toBe('Sarah Connor');
      });

      const req = httpTestingController.expectOne('/api/employees');
      expect(req.request.method).toBe('GET');
      req.flush(mockEmployees);
    });

    it('should handle HTTP error response when fetching employees fails (500)', () => {
      let actualError: Error | undefined;

      service.getEmployees().subscribe({
        next: () => fail('Should have failed with 500 error'),
        error: (err: Error) => {
          actualError = err;
        }
      });

      const req = httpTestingController.expectOne('/api/employees');
      req.flush('Internal Server Error', {
        status: 500,
        statusText: 'Server Error'
      });

      expect(actualError).toBeDefined();
      expect(actualError?.message).toContain('Server returned code 500');
    });
  });

  describe('GET /api/employees/:id', () => {
    it('should retrieve a single employee by id', () => {
      const target = mockEmployees[0];

      service.getEmployeeById(101).subscribe((employee) => {
        expect(employee).toEqual(target);
      });

      const req = httpTestingController.expectOne('/api/employees/101');
      expect(req.request.method).toBe('GET');
      req.flush(target);
    });

    it('should handle 404 Not Found error gracefully', () => {
      let actualError: Error | undefined;

      service.getEmployeeById(999).subscribe({
        next: () => fail('Should have failed with 404'),
        error: (err: Error) => {
          actualError = err;
        }
      });

      const req = httpTestingController.expectOne('/api/employees/999');
      req.flush('Employee not found', {
        status: 404,
        statusText: 'Not Found'
      });

      expect(actualError).toBeDefined();
      expect(actualError?.message).toContain('Server returned code 404');
    });
  });

  describe('POST /api/employees', () => {
    it('should send a POST request with new employee data', () => {
      const newEmployee: Omit<Employee, 'id'> = {
        name: 'Jordan Hayes',
        email: 'jordan.hayes@enterprise.io',
        role: 'DevOps Engineer',
        department: 'Engineering',
        salary: 125000,
        status: 'Active',
        location: 'Seattle, WA',
        joinedDate: '2024-01-15',
        performanceScore: 4.5
      };

      const createdResponse: Employee = {
        ...newEmployee,
        id: 103
      };

      service.createEmployee(newEmployee).subscribe((created) => {
        expect(created.id).toBe(103);
        expect(created.name).toBe('Jordan Hayes');
      });

      const req = httpTestingController.expectOne('/api/employees');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(newEmployee);
      req.flush(createdResponse);
    });
  });

  describe('PUT /api/employees/:id', () => {
    it('should send a PUT request to update employee record', () => {
      const changes: Partial<Employee> = {
        salary: 155000,
        status: 'Inactive'
      };

      const updatedResponse: Employee = {
        ...mockEmployees[0],
        ...changes
      };

      service.updateEmployee(101, changes).subscribe((result) => {
        expect(result.salary).toBe(155000);
        expect(result.status).toBe('Inactive');
      });

      const req = httpTestingController.expectOne('/api/employees/101');
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(changes);
      req.flush(updatedResponse);
    });
  });

  describe('DELETE /api/employees/:id', () => {
    it('should send a DELETE request for specified employee', () => {
      service.deleteEmployee(101).subscribe((res) => {
        expect(res).toBeNull();
      });

      const req = httpTestingController.expectOne('/api/employees/101');
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });
  });
});
