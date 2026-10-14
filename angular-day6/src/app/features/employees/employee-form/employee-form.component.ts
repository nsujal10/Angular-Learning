import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CreateEmployeeDto, Department, Employee, EmployeeStatus } from '../../../core/models/employee.model';
import { EmployeeStateService } from '../../../core/services/employee-state.service';

@Component({
  selector: 'app-employee-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './employee-form.component.html',
  styleUrl: './employee-form.component.css'
})
export class EmployeeFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  readonly state = inject(EmployeeStateService);

  @Input() employeeToEdit: Employee | null = null;
  @Output() close = new EventEmitter<void>();

  form!: FormGroup;

  readonly departments: Department[] = [
    'Engineering',
    'Design',
    'Product',
    'Marketing',
    'Operations'
  ];

  readonly statuses: EmployeeStatus[] = ['Active', 'On Leave', 'Terminated'];

  ngOnInit(): void {
    this.initForm();
  }

  private initForm(): void {
    this.form = this.fb.group({
      name: [this.employeeToEdit?.name || '', [Validators.required, Validators.minLength(2)]],
      email: [
        this.employeeToEdit?.email || '',
        [Validators.required, Validators.email]
      ],
      role: [this.employeeToEdit?.role || '', [Validators.required]],
      department: [this.employeeToEdit?.department || 'Engineering', [Validators.required]],
      status: [this.employeeToEdit?.status || 'Active', [Validators.required]],
      salary: [
        this.employeeToEdit?.salary || 95000,
        [Validators.required, Validators.min(30000), Validators.max(500000)]
      ],
      performanceScore: [
        this.employeeToEdit?.performanceScore || 85,
        [Validators.required, Validators.min(0), Validators.max(100)]
      ],
      skillsInput: [this.employeeToEdit?.skills.join(', ') || 'Angular, TypeScript', [Validators.required]],
      avatar: [
        this.employeeToEdit?.avatar ||
          'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
        [Validators.required]
      ]
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const val = this.form.value;
    const skills = val.skillsInput
      .split(',')
      .map((s: string) => s.trim())
      .filter((s: string) => s.length > 0);

    if (this.employeeToEdit) {
      // Update existing employee using update()
      this.state.updateEmployee(this.employeeToEdit.id, {
        name: val.name,
        email: val.email,
        role: val.role,
        department: val.department,
        status: val.status,
        salary: Number(val.salary),
        performanceScore: Number(val.performanceScore),
        skills,
        avatar: val.avatar
      });
    } else {
      // Create new employee using update()
      const newEmployeeDto: CreateEmployeeDto = {
        name: val.name,
        email: val.email,
        role: val.role,
        department: val.department,
        status: val.status,
        salary: Number(val.salary),
        performanceScore: Number(val.performanceScore),
        skills,
        avatar: val.avatar,
        joinDate: new Date().toISOString().split('T')[0]
      };
      this.state.createEmployee(newEmployeeDto);
    }

    this.close.emit();
  }

  onCancel(): void {
    this.close.emit();
  }
}
