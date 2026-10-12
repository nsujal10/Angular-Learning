import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  FormArray,
  Validators,
  ReactiveFormsModule
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { EmployeeService } from '../../../core/services/employee.service';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { CustomValidators } from '../../../shared/validators/custom-validators';
import { CanComponentDeactivate } from '../../../core/guards/unsaved-changes.guard';
import { Department } from '../../../core/models/employee.model';

@Component({
  selector: 'app-employee-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './employee-form.component.html',
  styleUrls: ['./employee-form.component.css']
})
export class EmployeeFormComponent implements OnInit, CanComponentDeactivate {
  employeeForm!: FormGroup;
  isEditMode = false;
  employeeId?: number;
  departments: Department[] = [];
  isSubmitting = false;
  isLoading = false;
  isSubmitted = false;
  serverErrorMsg: string | null = null;

  constructor(
    private fb: FormBuilder,
    private employeeService: EmployeeService,
    public authService: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.departments = this.employeeService.getDepartments();
    this.initForm();
    this.setupConditionalManagerFields();
    this.checkMode();
  }

  canDeactivate(): boolean {
    if (this.employeeForm.dirty && !this.isSubmitted) {
      return confirm('⚠️ You have unsaved changes in this form! Are you sure you want to discard them and leave?');
    }
    return true;
  }

  private initForm(): void {
    this.employeeForm = this.fb.group(
      {
        name: [
          '',
          [
            Validators.required,
            Validators.minLength(3),
            Validators.maxLength(50),
            CustomValidators.humanName()
          ]
        ],
        email: [
          '',
          [
            Validators.required,
            Validators.email,
            CustomValidators.corporateEmail('spikeoffice.io')
          ]
        ],
        department: ['Engineering', Validators.required],
        role: [
          '',
          [
            Validators.required,
            Validators.minLength(3),
            Validators.maxLength(60)
          ]
        ],
        salary: [
          75000,
          [
            Validators.required,
            Validators.min(30000),
            Validators.max(500000)
          ]
        ],
        active: [true],
        joinDate: [
          new Date().toISOString().substring(0, 10),
          Validators.required
        ],
        phone: [
          '',
          [Validators.pattern(/^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/)]
        ],
        isManager: [false],
        teamSize: [{ value: 0, disabled: true }],
        managerBonus: [{ value: 0, disabled: true }],
        notes: ['', [Validators.maxLength(300)]],
        skills: this.fb.array([], [Validators.required, Validators.minLength(1)])
      },
      {
        validators: [
          CustomValidators.departmentSalaryBenchmark(),
          CustomValidators.managerTeamSize()
        ]
      }
    );
  }

  get skillsArray(): FormArray {
    return this.employeeForm.get('skills') as FormArray;
  }

  addSkill(name: string = ''): void {
    const trimmed = name.trim();
    if (!trimmed) return;

    const existing = this.skillsArray.controls.map(c => c.value?.toLowerCase());
    if (existing.includes(trimmed.toLowerCase())) {
      this.notificationService.warning('Duplicate Skill', `"${trimmed}" is already present.`);
      return;
    }

    this.skillsArray.push(this.fb.control(trimmed, [Validators.required]));
    this.employeeForm.markAsDirty();
  }

  removeSkill(index: number): void {
    this.skillsArray.removeAt(index);
    this.employeeForm.markAsDirty();
  }

  private setupConditionalManagerFields(): void {
    const isManagerControl = this.employeeForm.get('isManager');
    const teamSizeControl = this.employeeForm.get('teamSize');
    const managerBonusControl = this.employeeForm.get('managerBonus');

    isManagerControl?.valueChanges.subscribe((isManager: boolean) => {
      if (isManager) {
        teamSizeControl?.enable();
        teamSizeControl?.setValidators([Validators.required, Validators.min(1)]);

        managerBonusControl?.enable();
        managerBonusControl?.setValidators([Validators.min(0)]);
      } else {
        teamSizeControl?.disable();
        teamSizeControl?.clearValidators();
        teamSizeControl?.setValue(0);

        managerBonusControl?.disable();
        managerBonusControl?.clearValidators();
        managerBonusControl?.setValue(0);
      }
      teamSizeControl?.updateValueAndValidity();
      managerBonusControl?.updateValueAndValidity();
    });
  }

  private checkMode(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.isEditMode = true;
      this.employeeId = Number(idParam);
      this.loadEmployeeFromApi(this.employeeId);
    } else {
      this.isEditMode = false;
      this.addSkill('Angular 17');
      this.addSkill('TypeScript');
    }
  }

  private loadEmployeeFromApi(id: number): void {
    this.isLoading = true;
    this.employeeService.getEmployeeById(id).subscribe({
      next: emp => {
        // Populated using patchValue() as required
        this.employeeForm.patchValue({
          name: emp.name,
          email: emp.email,
          department: emp.department,
          role: emp.role,
          salary: emp.salary,
          active: emp.active,
          joinDate: emp.joinDate,
          phone: emp.phone || '',
          isManager: emp.isManager || false,
          teamSize: emp.teamSize || 0,
          managerBonus: emp.managerBonus || 0,
          notes: emp.notes || ''
        });

        this.skillsArray.clear();
        if (emp.skills && emp.skills.length > 0) {
          emp.skills.forEach(skill => {
            this.skillsArray.push(this.fb.control(skill, [Validators.required]));
          });
        }

        this.employeeForm.markAsPristine();
        this.isLoading = false;
      },
      error: err => {
        this.isLoading = false;
        this.notificationService.error('Fetch Error', err.error?.message || `Failed to fetch employee #${id}`);
        this.router.navigate(['/employees']);
      }
    });
  }

  get f() {
    return this.employeeForm.controls;
  }

  get crossFieldErrors() {
    return this.employeeForm.errors;
  }

  onSubmit(): void {
    if (this.employeeForm.invalid) {
      this.employeeForm.markAllAsTouched();
      this.notificationService.error('Incomplete Form', 'Please correct validation issues before submitting.');
      return;
    }

    this.isSubmitting = true;
    this.serverErrorMsg = null;
    const formValue = this.employeeForm.getRawValue();

    if (this.isEditMode && this.employeeId) {
      this.employeeService.updateEmployee(this.employeeId, formValue).subscribe({
        next: updated => {
          this.isSubmitting = false;
          this.isSubmitted = true;
          this.notificationService.success('Profile Saved', `Updated profile for ${updated.name}.`);
          this.router.navigate(['/employees', this.employeeId]);
        },
        error: err => {
          this.isSubmitting = false;
          this.serverErrorMsg = err.error?.message || 'Server rejected the update request.';
        }
      });
    } else {
      this.employeeService.createEmployee(formValue).subscribe({
        next: created => {
          this.isSubmitting = false;
          this.isSubmitted = true;
          this.notificationService.success('Employee Onboarded', `Created account for ${created.name}.`);
          this.router.navigate(['/employees', created.id]);
        },
        error: err => {
          this.isSubmitting = false;
          this.serverErrorMsg = err.error?.message || 'Server rejected the creation request.';
        }
      });
    }
  }

  cancel(): void {
    if (this.isEditMode && this.employeeId) {
      this.router.navigate(['/employees', this.employeeId]);
    } else {
      this.router.navigate(['/employees']);
    }
  }
}
