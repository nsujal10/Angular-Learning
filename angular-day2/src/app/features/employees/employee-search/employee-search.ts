import { Component, output, model, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface EmployeeFilterCriteria {
  searchTerm: string;
  department: string;
  status: 'all' | 'active' | 'inactive';
}

@Component({
  selector: 'app-employee-search',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './employee-search.html',
  styleUrl: './employee-search.css'
})
export class EmployeeSearchComponent {
  departments = input<string[]>([
    'All Departments',
    'Engineering',
    'Design',
    'Product',
    'Marketing',
    'Human Resources'
  ]);

  searchTerm = '';
  selectedDepartment = 'All Departments';
  selectedStatus: 'all' | 'active' | 'inactive' = 'all';

  criteriaChange = output<EmployeeFilterCriteria>();
  addRequested = output<void>();

  onFilterChange(): void {
    this.criteriaChange.emit({
      searchTerm: this.searchTerm.trim(),
      department: this.selectedDepartment,
      status: this.selectedStatus
    });
  }

  onReset(): void {
    this.searchTerm = '';
    this.selectedDepartment = 'All Departments';
    this.selectedStatus = 'all';
    this.onFilterChange();
  }

  triggerAdd(): void {
    this.addRequested.emit();
  }
}
