import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule, CurrencyPipe, UpperCasePipe } from '@angular/common';
import { Employee } from '../models/employee.model';
import { InitialsPipe } from '../../../shared/pipes/initials.pipe';

/**
 * EmployeeCardComponent
 * Standalone component that renders detailed information about a selected employee.
 * 
 * Demonstrates:
 * - Standalone components (@Component with standalone: true)
 * - Input properties (@Input) to receive state from the parent container
 * - Output events (@Output EventEmitter) to notify parent of user actions
 * - Angular control flow (@if) for conditional rendering
 * - Built-in pipes: CurrencyPipe, UpperCasePipe
 * - Custom pipe: InitialsPipe
 */
@Component({
  selector: 'app-employee-card',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, UpperCasePipe, InitialsPipe],
  templateUrl: './employee-card.component.html',
  styleUrl: './employee-card.component.css'
})
export class EmployeeCardComponent {
  /**
   * The currently selected employee passed from parent container.
   * Can be null if nothing has been selected yet.
   */
  @Input() employee: Employee | null = null;

  /**
   * Emitted when user closes or deselects this employee card.
   */
  @Output() clear = new EventEmitter<void>();

  /**
   * Emitted when the "View Full Profile" or action button is triggered.
   */
  @Output() viewDetails = new EventEmitter<Employee>();

  /**
   * Handles action button click
   */
  onViewDetails(): void {
    if (this.employee) {
      this.viewDetails.emit(this.employee);
    }
  }

  /**
   * Handles dismiss/clear
   */
  onClose(): void {
    this.clear.emit();
  }
}
