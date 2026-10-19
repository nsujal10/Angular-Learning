import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { EmployeeFormComponent } from './employee-form.component';
import { A11yAnnouncerService } from '../../core/services/a11y-announcer.service';
import { I18nService } from '../../core/services/i18n.service';
import { NotificationService } from '../../core/services/notification.service';

describe('EmployeeFormComponent (WCAG Accessibility & Form Validation)', () => {
  let component: EmployeeFormComponent;
  let fixture: ComponentFixture<EmployeeFormComponent>;
  let announcerSpy: jasmine.SpyObj<A11yAnnouncerService>;

  beforeEach(async () => {
    announcerSpy = jasmine.createSpyObj('A11yAnnouncerService', ['announce']);

    await TestBed.configureTestingModule({
      imports: [EmployeeFormComponent, ReactiveFormsModule],
      providers: [
        { provide: A11yAnnouncerService, useValue: announcerSpy },
        I18nService,
        NotificationService
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(EmployeeFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with invalid empty form state', () => {
    expect(component.employeeForm.valid).toBeFalse();
    expect(component.employeeForm.get('fullName')?.valid).toBeFalse();
    expect(component.employeeForm.get('email')?.valid).toBeFalse();
  });

  it('should announce validation errors when submitted with empty fields', () => {
    component.onSubmit();
    fixture.detectChanges();

    expect(component.isSubmitted()).toBeTrue();
    expect(announcerSpy.announce).toHaveBeenCalledWith(
      jasmine.stringMatching(/validation errors/i),
      'assertive'
    );
  });

  it('should validate email format and update aria-invalid on input', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const emailInput = compiled.querySelector('#email') as HTMLInputElement;

    emailInput.value = 'invalid-email-string';
    emailInput.dispatchEvent(new Event('input'));
    emailInput.dispatchEvent(new Event('blur'));
    fixture.changeDetectorRef.markForCheck();
    fixture.detectChanges();

    expect(component.employeeForm.get('email')?.valid).toBeFalse();
    expect(component.isFieldInvalid('email')).toBeTrue();
    expect(emailInput.getAttribute('aria-invalid')).toBe('true');
  });

  it('should submit successfully with valid data and announce to screen reader', () => {
    component.employeeForm.patchValue({
      fullName: 'Maya Lin Patel',
      email: 'maya.patel@enterprise.io',
      department: 'Engineering',
      role: 'Staff Cloud Architect',
      salary: 135000
    });

    expect(component.employeeForm.valid).toBeTrue();
    component.onSubmit();
    fixture.detectChanges();

    expect(component.employees().some((e) => e.fullName === 'Maya Lin Patel')).toBeTrue();
    expect(announcerSpy.announce).toHaveBeenCalledWith(
      jasmine.stringMatching(/successfully/i),
      'polite'
    );
  });

  it('should clear form and announce on reset', () => {
    component.employeeForm.patchValue({ fullName: 'Testing' });
    component.resetForm();
    fixture.detectChanges();

    expect(component.employeeForm.get('fullName')?.value).toBe('');
    expect(announcerSpy.announce).toHaveBeenCalledWith('Form has been cleared.', 'polite');
  });
});
