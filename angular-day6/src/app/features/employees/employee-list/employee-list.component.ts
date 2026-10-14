import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Department, Employee } from '../../../core/models/employee.model';
import { EmployeeStateService } from '../../../core/services/employee-state.service';

@Component({
  selector: 'app-employee-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './employee-list.component.html',
  styleUrl: './employee-list.component.css'
})
export class EmployeeListComponent {
  readonly state = inject(EmployeeStateService);

  @Output() createEmployee = new EventEmitter<void>();
  @Output() editEmployee = new EventEmitter<Employee>();

  readonly departments: (Department | 'All')[] = [
    'All',
    'Engineering',
    'Design',
    'Product',
    'Marketing',
    'Operations'
  ];

  onSearchChange(term: string): void {
    // Triggers writable signal set()
    this.state.setSearchTerm(term);
  }

  onSelectEmployee(id: number): void {
    // Triggers writable signal set()
    this.state.selectEmployee(id);
  }

  onDepartmentSelect(dept: Department | 'All'): void {
    this.state.setSelectedDepartment(dept);
  }

  onDelete(id: number, event: MouseEvent): void {
    event.stopPropagation();
    if (confirm('Are you sure you want to remove this employee?')) {
      // Triggers writable signal update()
      this.state.deleteEmployee(id);
    }
  }

  onEdit(employee: Employee, event: MouseEvent): void {
    event.stopPropagation();
    this.editEmployee.emit(employee);
  }

  onCreate(): void {
    this.createEmployee.emit();
  }
}
