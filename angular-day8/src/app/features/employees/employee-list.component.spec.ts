import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { EmployeeListComponent } from './employee-list.component';
import { EmployeeService } from '../../core/services/employee.service';
import { Employee } from '../../core/models/employee.model';
import { of } from 'rxjs';

describe('EmployeeListComponent', () => {
  let component: EmployeeListComponent;
  let fixture: ComponentFixture<EmployeeListComponent>;
  let employeeServiceSpy: jasmine.SpyObj<EmployeeService>;

  const testEmployees: Employee[] = [
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
      role: 'Lead UX Designer',
      department: 'Design',
      salary: 118000,
      status: 'Active',
      location: 'Austin, TX',
      joinedDate: '2022-01-10',
      performanceScore: 4.7
    },
    {
      id: 103,
      name: 'Liam Chen',
      email: 'liam.chen@enterprise.io',
      role: 'Senior Product Manager',
      department: 'Product',
      salary: 132000,
      status: 'Inactive',
      location: 'New York, NY',
      joinedDate: '2019-11-20',
      performanceScore: 4.6
    }
  ];

  beforeEach(async () => {
    const spy = jasmine.createSpyObj('EmployeeService', ['getEmployees', 'getInitialSeedEmployees']);
    spy.getEmployees.and.returnValue(of(testEmployees));
    spy.getInitialSeedEmployees.and.returnValue(testEmployees);

    await TestBed.configureTestingModule({
      imports: [EmployeeListComponent],
      providers: [
        { provide: EmployeeService, useValue: spy },
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(EmployeeListComponent);
    component = fixture.componentInstance;
    employeeServiceSpy = TestBed.inject(EmployeeService) as jasmine.SpyObj<EmployeeService>;
    fixture.detectChanges();
  });

  it('should create the EmployeeListComponent', () => {
    expect(component).toBeTruthy();
  });

  describe('Initial Rendering', () => {
    it('should load and render initial employee list', () => {
      expect(component.employees().length).toBe(3);
      expect(component.filteredEmployees().length).toBe(3);

      const rows = fixture.nativeElement.querySelectorAll('.employee-row');
      expect(rows.length).toBe(3);
    });

    it('should display correct initial KPI metrics', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.querySelector('#kpi-total-employees')?.textContent?.trim()).toBe('3');
      expect(compiled.querySelector('#kpi-active-employees')?.textContent?.trim()).toBe('2');
      expect(compiled.querySelector('#kpi-on-leave')?.textContent?.trim()).toBe('0');
    });

    it('should render employee names, roles, and salaries in table', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const firstNameEl = compiled.querySelector('#employee-name-101');
      expect(firstNameEl?.textContent).toContain('Sarah Connor');

      const firstSalaryEl = compiled.querySelector('#employee-salary-101');
      expect(firstSalaryEl?.textContent).toContain('145,000');
    });
  });

  describe('Filtering with computed()', () => {
    it('should filter employees reactively by search query (case-insensitive)', () => {
      component.searchQuery.set('marcus');
      fixture.detectChanges();

      expect(component.filteredEmployees().length).toBe(1);
      expect(component.filteredEmployees()[0].name).toBe('Marcus Vance');

      const rows = fixture.nativeElement.querySelectorAll('.employee-row');
      expect(rows.length).toBe(1);
    });

    it('should filter employees by department dropdown', () => {
      component.setDepartment('Engineering');
      fixture.detectChanges();

      expect(component.filteredEmployees().length).toBe(1);
      expect(component.filteredEmployees()[0].department).toBe('Engineering');
    });

    it('should filter employees by status dropdown', () => {
      component.setStatus('Inactive');
      fixture.detectChanges();

      expect(component.filteredEmployees().length).toBe(1);
      expect(component.filteredEmployees()[0].status).toBe('Inactive');
      expect(component.filteredEmployees()[0].name).toBe('Liam Chen');
    });

    it('should show empty state message when no employees match filters', () => {
      component.searchQuery.set('xyz-nonexistent-worker');
      fixture.detectChanges();

      expect(component.filteredEmployees().length).toBe(0);
      const emptyStateEl = fixture.nativeElement.querySelector('.empty-state');
      expect(emptyStateEl).toBeTruthy();
      expect(emptyStateEl.textContent).toContain('No employees found');
    });
  });

  describe('Employee Updates (Immutable State & OnPush)', () => {
    it('should toggle employee status immutably and update badge', () => {
      // Toggle Sarah Connor from Active -> Inactive
      component.toggleStatus(101);
      fixture.detectChanges();

      const sarah = component.employees().find((e) => e.id === 101);
      expect(sarah?.status).toBe('Inactive');
      expect(component.activeCount()).toBe(1);

      const statusPill = fixture.nativeElement.querySelector('[data-employee-id="101"] .status-pill');
      expect(statusPill.textContent).toContain('Inactive');
    });

    it('should adjust employee salary immutably', () => {
      const initialSalary = component.employees().find((e) => e.id === 101)!.salary;
      component.adjustSalary(101, 5000);
      fixture.detectChanges();

      const updatedSarah = component.employees().find((e) => e.id === 101);
      expect(updatedSarah?.salary).toBe(initialSalary + 5000);

      const salaryEl = fixture.nativeElement.querySelector('#employee-salary-101');
      expect(salaryEl.textContent).toContain('150,000');
    });

    it('should delete employee immutably and update list', () => {
      expect(component.employees().length).toBe(3);

      component.deleteEmployee(103);
      fixture.detectChanges();

      expect(component.employees().length).toBe(2);
      expect(component.employees().some((e) => e.id === 103)).toBeFalse();

      const rows = fixture.nativeElement.querySelectorAll('.employee-row');
      expect(rows.length).toBe(2);
    });

    it('should add a new employee immutably via modal form', () => {
      component.newEmployeeForm.set({
        name: 'Jordan Belfort',
        email: 'jordan.b@enterprise.io',
        role: 'Quantitative Trader',
        department: 'Finance',
        salary: 160000,
        status: 'Active',
        location: 'New York, NY',
        joinedDate: '2024-01-01',
        performanceScore: 4.8
      });

      component.saveNewEmployee();
      fixture.detectChanges();

      expect(component.employees().length).toBe(4);
      expect(component.employees()[0].name).toBe('Jordan Belfort');
      expect(component.isModalOpen()).toBeFalse();
    });
  });

  describe('Pagination & Button Interactions', () => {
    it('should paginate items according to pageSize', () => {
      component.pageSize.set(2);
      component.currentPage.set(1);
      fixture.detectChanges();

      expect(component.totalPages()).toBe(2);
      expect(component.pagedEmployees().length).toBe(2);
      expect(component.pagedEmployees()[0].id).toBe(103); // 'Liam Chen' alphabetically first

      // Navigate to next page
      component.setPage(2);
      fixture.detectChanges();

      expect(component.currentPage()).toBe(2);
      expect(component.pagedEmployees().length).toBe(1);
      expect(component.pagedEmployees()[0].id).toBe(101); // 'Sarah Connor' on page 2
    });

    it('should trigger search filter from input event', () => {
      const searchInput = fixture.nativeElement.querySelector('#employee-search-input') as HTMLInputElement;
      searchInput.value = 'Vance';
      searchInput.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      expect(component.searchQuery()).toBe('Vance');
      expect(component.filteredEmployees().length).toBe(1);
    });

    it('should toggle sort direction when clicking header', () => {
      expect(component.sortField()).toBe('name');
      expect(component.sortDirection()).toBe('asc');

      component.setSort('name');
      expect(component.sortDirection()).toBe('desc');

      component.setSort('salary');
      expect(component.sortField()).toBe('salary');
      expect(component.sortDirection()).toBe('asc');
    });
  });
});
