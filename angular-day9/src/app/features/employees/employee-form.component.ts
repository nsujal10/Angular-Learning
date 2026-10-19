import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DEPARTMENTS, DepartmentType, Employee } from '../../core/models/employee.model';
import { A11yAnnouncerService } from '../../core/services/a11y-announcer.service';
import { I18nService } from '../../core/services/i18n.service';
import { NotificationService } from '../../core/services/notification.service';
import { LocalizedCurrencyPipe } from '../../core/pipes/localized-currency.pipe';
import { LocalizedDatePipe } from '../../core/pipes/localized-date.pipe';

@Component({
  selector: 'app-employee-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LocalizedCurrencyPipe, LocalizedDatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './employee-form.component.html',
  styleUrls: ['./employee-form.component.scss']
})
export class EmployeeFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly announcer = inject(A11yAnnouncerService);
  readonly i18n = inject(I18nService);
  private readonly notification = inject(NotificationService);

  readonly departments = DEPARTMENTS;
  readonly isSubmitted = signal<boolean>(false);
  readonly formSuccess = signal<string | null>(null);

  // Sample employee records
  readonly employees = signal<Employee[]>([
    {
      id: 'emp_101',
      fullName: 'Sarah Connor',
      email: 'sarah.connor@enterprise.io',
      department: 'Information Security',
      role: 'Staff Security Engineer',
      salary: 145000,
      hireDate: '2023-04-12',
      status: 'Active'
    },
    {
      id: 'emp_102',
      fullName: 'Marcus Vance',
      email: 'marcus.vance@enterprise.io',
      department: 'Product & Design',
      role: 'Lead UX Designer',
      salary: 120000,
      hireDate: '2023-08-01',
      status: 'Active'
    }
  ]);

  readonly employeeForm: FormGroup = this.fb.group({
    fullName: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    department: ['Engineering', [Validators.required]],
    role: ['', [Validators.required, Validators.minLength(2)]],
    salary: [85000, [Validators.required, Validators.min(30000)]]
  });

  // Getter helpers for accessible template checks
  get f() {
    return this.employeeForm.controls;
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.employeeForm.get(fieldName);
    return !!(field && field.invalid && (field.touched || this.isSubmitted()));
  }

  onSubmit(): void {
    this.isSubmitted.set(true);

    if (this.employeeForm.invalid) {
      this.announcer.announce(
        'The form contains validation errors. Please review the highlighted fields.',
        'assertive'
      );
      // Accessible focus: move focus to first invalid input
      this.focusFirstError();
      return;
    }

    const val = this.employeeForm.value;
    const newEmp: Employee = {
      id: 'emp_' + Math.floor(1000 + Math.random() * 9000),
      fullName: val.fullName,
      email: val.email,
      department: val.department,
      role: val.role,
      salary: Number(val.salary),
      hireDate: new Date().toISOString().split('T')[0],
      status: 'Active'
    };

    this.employees.update((list) => [newEmp, ...list]);

    const msg = this.i18n.t().formSuccessMessage;
    this.formSuccess.set(msg);
    this.announcer.announce(msg, 'polite');
    this.notification.show({
      type: 'success',
      title: 'Form Submitted',
      message: `Employee ${newEmp.fullName} successfully registered.`
    });

    this.resetForm();
    setTimeout(() => this.formSuccess.set(null), 5000);
  }

  resetForm(): void {
    this.employeeForm.reset({
      fullName: '',
      email: '',
      department: 'Engineering',
      role: '',
      salary: 85000
    });
    this.isSubmitted.set(false);
    this.announcer.announce('Form has been cleared.', 'polite');
  }

  private focusFirstError(): void {
    setTimeout(() => {
      const firstInvalidControl = document.querySelector<HTMLInputElement>(
        'input[aria-invalid="true"], select[aria-invalid="true"]'
      );
      if (firstInvalidControl) {
        firstInvalidControl.focus();
      }
    }, 50);
  }
}
