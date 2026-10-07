import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule, CurrencyPipe, UpperCasePipe } from '@angular/common';
import { Employee } from '../models/employee.model';
import { InitialsPipe } from '../../../shared/pipes/initials.pipe';

/**
 * EmployeeListComponent
 * Presentational component responsible for rendering a responsive list/table of employees.
 * 
 * Features & Day 1 concepts demonstrated:
 * - Standalone component architecture
 * - Template control flow: @for (with track expression) and @if
 * - Built-in formatting pipes: CurrencyPipe, UpperCasePipe
 * - Custom pipe: InitialsPipe
 * - Component interaction via @Input (receives filtered list) and @Output (emits selection)
 */
@Component({
  selector: 'app-employee-list',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, UpperCasePipe, InitialsPipe],
  templateUrl: './employee-list.component.html',
  styleUrl: './employee-list.component.css'
})
export class EmployeeListComponent {
  /**
   * The list of employees to display. Filtered by the parent dashboard component.
   */
  @Input({ required: true }) employees: Employee[] = [];

  /**
   * The ID of the currently selected employee for row highlight.
   */
  @Input() selectedEmployeeId: number | null = null;

  /**
   * Event emitted when the user clicks "View" or selects an employee item.
   */
  @Output() employeeSelected = new EventEmitter<Employee>();

  /**
   * Handles user click event on an employee item or view button.
   * Requirement 8: Click event handler
   */
  selectEmployee(employee: Employee): void {
    this.employeeSelected.emit(employee);
  }
}
