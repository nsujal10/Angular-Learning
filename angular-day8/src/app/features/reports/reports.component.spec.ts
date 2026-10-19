import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ReportsComponent } from './reports.component';
import { EmployeeService } from '../../core/services/employee.service';
import { Employee } from '../../core/models/employee.model';
import { of } from 'rxjs';

describe('ReportsComponent', () => {
  let component: ReportsComponent;
  let fixture: ComponentFixture<ReportsComponent>;

  const mockEmployees: Employee[] = [
    {
      id: 101,
      name: 'Sarah Connor',
      email: 'sarah.connor@enterprise.io',
      role: 'Principal Cloud Architect',
      department: 'Engineering',
      salary: 150000,
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
      salary: 110000,
      status: 'Active',
      location: 'Austin, TX',
      joinedDate: '2022-01-10',
      performanceScore: 4.7
    }
  ];

  beforeEach(async () => {
    const serviceSpy = jasmine.createSpyObj('EmployeeService', ['getEmployees', 'getInitialSeedEmployees']);
    serviceSpy.getEmployees.and.returnValue(of(mockEmployees));
    serviceSpy.getInitialSeedEmployees.and.returnValue(mockEmployees);

    await TestBed.configureTestingModule({
      imports: [ReportsComponent],
      providers: [
        { provide: EmployeeService, useValue: serviceSpy },
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ReportsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create ReportsComponent', () => {
    expect(component).toBeTruthy();
  });

  it('should calculate company-wide total budget and average salary', () => {
    expect(component.totalBudget()).toBe(260000);
    expect(component.averageCompanySalary()).toBe(130000);
    expect(component.totalActiveRate()).toBe(100);
  });

  it('should compute department report metrics', () => {
    const reports = component.departmentReports();
    expect(reports.length).toBe(2);

    const engReport = reports.find((r) => r.department === 'Engineering');
    expect(engReport?.headcount).toBe(1);
    expect(engReport?.totalBudget).toBe(150000);
    expect(engReport?.avgSalary).toBe(150000);

    const designReport = reports.find((r) => r.department === 'Design');
    expect(designReport?.headcount).toBe(1);
    expect(designReport?.totalBudget).toBe(110000);
  });

  it('should trigger CSV export when export button is clicked', () => {
    spyOn(component, 'exportReportCsv').and.callThrough();
    const exportBtn = fixture.nativeElement.querySelector('#export-csv-btn') as HTMLButtonElement;
    exportBtn.click();
    expect(component.exportReportCsv).toHaveBeenCalled();
  });
});
