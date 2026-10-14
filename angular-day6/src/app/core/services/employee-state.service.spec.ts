import { TestBed } from '@angular/core/testing';
import { CreateEmployeeDto, INITIAL_EMPLOYEES } from '../models/employee.model';
import { EmployeeApiService } from './employee-api.service';
import { EmployeeStateService } from './employee-state.service';

describe('EmployeeStateService (Signals Fundamentals & Immutable Updates)', () => {
  let service: EmployeeStateService;

  beforeEach(() => {
    // Clear localStorage before each test
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem('employee_dashboard_pref');
    }

    TestBed.configureTestingModule({
      providers: [EmployeeStateService, EmployeeApiService]
    });

    service = TestBed.inject(EmployeeStateService);
    service.resetState();
  });

  describe('Computed Filtering', () => {
    it('should compute filteredEmployees based on search query matching name', () => {
      service.setSearchTerm('Sarah');
      const filtered = service.filteredEmployees();

      expect(filtered.length).toBe(1);
      expect(filtered[0].name).toBe('Sarah Connor');
      expect(service.employeeCount()).toBe(1);
    });

    it('should compute filteredEmployees based on query matching role', () => {
      service.setSearchTerm('Architect');
      const filtered = service.filteredEmployees();

      expect(filtered.some(e => e.name === 'Sarah Connor')).toBeTrue();
      expect(service.employeeCount()).toBe(filtered.length);
    });

    it('should compute filteredEmployees based on query matching skills', () => {
      service.setSearchTerm('Figma');
      const filtered = service.filteredEmployees();

      expect(filtered.length).toBe(1);
      expect(filtered[0].name).toBe('Marcus Vance');
    });

    it('should filter by department and recalculate count', () => {
      service.setSelectedDepartment('Engineering');
      const filtered = service.filteredEmployees();

      expect(filtered.every(e => e.department === 'Engineering')).toBeTrue();
      expect(service.employeeCount()).toBe(filtered.length);
    });

    it('should combine department filter and search query seamlessly', () => {
      service.setSelectedDepartment('Engineering');
      service.setSearchTerm('Elena');
      const filtered = service.filteredEmployees();

      expect(filtered.length).toBe(1);
      expect(filtered[0].name).toBe('Elena Rostova');
      expect(service.employeeCount()).toBe(1);
    });

    it('should compute selectedEmployee reactively from selectedEmployeeId', () => {
      service.selectEmployee(2);
      expect(service.selectedEmployee()?.name).toBe('Marcus Vance');

      service.selectEmployee(999);
      expect(service.selectedEmployee()).toBeNull();

      service.selectEmployee(null);
      expect(service.selectedEmployee()).toBeNull();
    });

    it('should compute departmentStats correctly across all employees', () => {
      const stats = service.departmentStats();
      expect(stats['Engineering']).toBeGreaterThan(0);
      expect(stats['Design']).toBeGreaterThan(0);
      expect(stats['Product']).toBeGreaterThan(0);
    });
  });

  describe('Immutable Updates via set() and update()', () => {
    it('should immutably add a new employee via createEmployee()', () => {
      const initialRef = service.employees();
      const initialLength = initialRef.length;

      const newDto: CreateEmployeeDto = {
        name: 'Grace Hopper',
        email: 'grace.hopper@cyberdyne.dev',
        role: 'Chief Computing Pioneer',
        department: 'Engineering',
        status: 'Active',
        salary: 195000,
        avatar: 'https://example.com/avatar.jpg',
        performanceScore: 100,
        joinDate: '2026-01-01',
        skills: ['Compilers', 'COBOL', 'Architecture']
      };

      const created = service.createEmployee(newDto);
      const updatedRef = service.employees();

      // Verify reference immutability (new array reference created)
      expect(updatedRef).not.toBe(initialRef);
      expect(updatedRef.length).toBe(initialLength + 1);
      expect(created.name).toBe('Grace Hopper');
      expect(created.id).toBeDefined();

      // Verify new employee is automatically selected
      expect(service.selectedEmployeeId()).toBe(created.id);
      expect(service.selectedEmployee()?.name).toBe('Grace Hopper');
    });

    it('should immutably update an employee via updateEmployee()', () => {
      const initialRef = service.employees();
      const targetId = 1;

      service.updateEmployee(targetId, {
        role: 'Distinguished Fellow',
        salary: 200000
      });

      const updatedRef = service.employees();

      // Verify array reference changed
      expect(updatedRef).not.toBe(initialRef);

      const target = updatedRef.find(e => e.id === targetId);
      expect(target?.role).toBe('Distinguished Fellow');
      expect(target?.salary).toBe(200000);

      // Verify other items retained their values
      const other = updatedRef.find(e => e.id === 2);
      expect(other?.name).toBe('Marcus Vance');
    });

    it('should immutably remove an employee via deleteEmployee()', () => {
      const initialRef = service.employees();
      const initialLength = initialRef.length;
      const targetId = 1;

      // Select target before deleting
      service.selectEmployee(targetId);
      expect(service.selectedEmployeeId()).toBe(targetId);

      service.deleteEmployee(targetId);
      const updatedRef = service.employees();

      // Verify array reference changed
      expect(updatedRef).not.toBe(initialRef);
      expect(updatedRef.length).toBe(initialLength - 1);
      expect(updatedRef.some(e => e.id === targetId)).toBeFalse();

      // Verify selected employee reset to null when selected item deleted
      expect(service.selectedEmployeeId()).toBeNull();
      expect(service.selectedEmployee()).toBeNull();
    });

    it('should update theme immutably via toggleTheme()', () => {
      const initial = service.theme();
      service.toggleTheme();
      expect(service.theme()).not.toBe(initial);
      service.toggleTheme();
      expect(service.theme()).toBe(initial);
    });
  });
});
