import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule
} from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSliderModule } from '@angular/material/slider';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { EmployeeApiService } from '../../data-access/employee-api.service';
import { Employee } from '../../../../core/models/employee.model';

@Component({
  selector: 'app-employee-form',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatSliderModule,
    MatSnackBarModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './employee-form.component.html',
  styleUrl: './employee-form.component.scss'
})
export class EmployeeFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private employeeApi = inject(EmployeeApiService);
  private snackBar = inject(MatSnackBar);

  employeeForm!: FormGroup;
  isEditMode = signal(false);
  employeeId = signal<number | null>(null);
  isSubmitting = signal(false);
  serverErrorMessage = signal<string | null>(null);

  departments = [
    'Engineering',
    'Design',
    'Product',
    'HR',
    'Finance',
    'Marketing',
    'Sales'
  ];

  statuses = ['Active', 'OnLeave', 'Terminated'];

  ngOnInit(): void {
    this.initForm();

    // Check if editing existing employee
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode.set(true);
      this.employeeId.set(Number(id));

      // Check resolved data
      this.route.data.subscribe(data => {
        if (data['employee']) {
          this.patchForm(data['employee']);
        } else {
          this.employeeApi.getEmployeeById(Number(id)).subscribe(emp => {
            this.patchForm(emp);
          });
        }
      });
    }
  }

  private initForm(): void {
    this.employeeForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      lastName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.pattern(/^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s\./0-9]*$/)]],
      department: ['Engineering', [Validators.required]],
      role: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(60)]],
      salary: [120000, [Validators.required, Validators.min(20000), Validators.max(500000)]],
      joiningDate: [new Date().toISOString().substring(0, 10), [Validators.required]],
      status: ['Active', [Validators.required]],
      performanceScore: [85, [Validators.required, Validators.min(1), Validators.max(100)]],
      bio: ['', [Validators.maxLength(500)]]
    });
  }

  private patchForm(emp: Employee): void {
    const formattedDate = emp.joiningDate
      ? new Date(emp.joiningDate).toISOString().substring(0, 10)
      : new Date().toISOString().substring(0, 10);

    this.employeeForm.patchValue({
      firstName: emp.firstName,
      lastName: emp.lastName,
      email: emp.email,
      phone: emp.phone,
      department: emp.department,
      role: emp.role,
      salary: emp.salary,
      joiningDate: formattedDate,
      status: emp.status,
      performanceScore: emp.performanceScore,
      bio: emp.bio || ''
    });
  }

  onSubmit(): void {
    if (this.employeeForm.invalid) {
      this.employeeForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.serverErrorMessage.set(null);
    const formValue = this.employeeForm.value;

    if (this.isEditMode() && this.employeeId()) {
      const id = this.employeeId()!;
      this.employeeApi.updateEmployee(id, { id, ...formValue }).subscribe({
        next: (updated) => {
          this.isSubmitting.set(false);
          this.snackBar.open(`Employee #${updated.id} successfully updated!`, 'Dismiss', { duration: 3500 });
          this.router.navigate(['/employees', updated.id]);
        },
        error: (err) => {
          this.isSubmitting.set(false);
          const msg = err.error?.message || err.error?.Email?.[0] || 'Validation error while updating employee.';
          this.serverErrorMessage.set(msg);
        }
      });
    } else {
      this.employeeApi.createEmployee(formValue).subscribe({
        next: (created) => {
          this.isSubmitting.set(false);
          this.snackBar.open(`Employee ${created.firstName} successfully added to directory!`, 'Dismiss', { duration: 3500 });
          this.router.navigate(['/employees']);
        },
        error: (err) => {
          this.isSubmitting.set(false);
          const msg = err.error?.message || err.error?.Email?.[0] || 'Server error while creating employee.';
          this.serverErrorMessage.set(msg);
        }
      });
    }
  }
}
