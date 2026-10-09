import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  FormArray,
  Validators,
  ReactiveFormsModule,
  AbstractControl
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { EmployeeService } from '../../../core/services/employee.service';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { CustomValidators } from '../../../shared/validators/custom-validators';
import { CanComponentDeactivate } from '../../../core/guards/unsaved-changes.guard';
import { Department, Employee } from '../../../core/models/employee.model';

@Component({
  selector: 'app-employee-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './employee-form.component.html',
  styleUrls: ['./employee-form.component.css']
})
export class EmployeeFormComponent implements OnInit, CanComponentDeactivate {
  employeeForm!: FormGroup;
  isEditMode: boolean = false;
  employeeId?: number;
  departments: Department[] = [];
  isSubmitted: boolean = false;

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
    this.checkRouteMode();
    this.setupConditionalManagerFields();
  }

  // Implementation of CanComponentDeactivate for unsavedChangesGuard
  canDeactivate(): boolean {
    if (this.employeeForm.dirty && !this.isSubmitted) {
      return confirm('⚠️ You have unsaved changes in this form! Are you sure you want to discard your work and leave this page?');
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
        // Cross-Field Validators applied to the entire FormGroup
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

  addSkill(skillName: string = ''): void {
    const trimmed = skillName.trim();
    if (!trimmed) return;

    // Prevent duplicate skills
    const existing = this.skillsArray.controls.map(c => c.value?.toLowerCase());
    if (existing.includes(trimmed.toLowerCase())) {
      this.notificationService.warning('Duplicate Skill', `"${trimmed}" is already added.`);
      return;
    }

    this.skillsArray.push(this.fb.control(trimmed, [Validators.required]));
    this.employeeForm.markAsDirty();
  }

  removeSkill(index: number): void {
    this.skillsArray.removeAt(index);
    this.employeeForm.markAsDirty();
  }

  /**
   * Dynamically enables or disables manager-only fields based on `isManager` checkbox
   */
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

  private checkRouteMode(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.isEditMode = true;
      this.employeeId = Number(idParam);
      this.loadEmployeeData(this.employeeId);
    } else {
      this.isEditMode = false;
      // Provide initial default skill for new employee
      this.addSkill('Angular');
      this.addSkill('TypeScript');
    }
  }

  private loadEmployeeData(id: number): void {
    const emp = this.employeeService.getEmployeeById(id);
    if (!emp) {
      this.notificationService.error('Employee Not Found', `No employee with ID ${id}`);
      this.router.navigate(['/employees']);
      return;
    }

    // Populate Form using patchValue() as required
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

    // Populate FormArray with existing skills
    this.skillsArray.clear();
    if (emp.skills && emp.skills.length > 0) {
      emp.skills.forEach(skill => {
        this.skillsArray.push(this.fb.control(skill, [Validators.required]));
      });
    }

    // Reset dirty state after initial patchValue population
    this.employeeForm.markAsPristine();
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
      this.notificationService.error('Incomplete Form', 'Please fix validation errors before submitting.');
      return;
    }

    const formValue = this.employeeForm.getRawValue();
    this.isSubmitted = true;

    if (this.isEditMode && this.employeeId) {
      this.employeeService.updateEmployee(this.employeeId, formValue);
      this.notificationService.success(
        'Employee Updated',
        `Changes saved for ${formValue.name}.`
      );
      this.router.navigate(['/employees', this.employeeId]);
    } else {
      const created = this.employeeService.addEmployee(formValue);
      this.notificationService.success(
        'Employee Created',
        `New record registered for ${created.name}.`
      );
      this.router.navigate(['/employees', created.id]);
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
