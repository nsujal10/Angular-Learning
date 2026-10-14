import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output, inject } from '@angular/core';
import { Employee } from '../../../core/models/employee.model';
import { EmployeeStateService } from '../../../core/services/employee-state.service';

@Component({
  selector: 'app-employee-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './employee-detail.component.html',
  styleUrl: './employee-detail.component.css'
})
export class EmployeeDetailComponent {
  // Injects shared state service (Shared application state between list and details)
  readonly state = inject(EmployeeStateService);

  @Output() editEmployee = new EventEmitter<Employee>();

  onDelete(id: number): void {
    if (confirm('Are you sure you want to delete this employee?')) {
      this.state.deleteEmployee(id);
    }
  }

  onEdit(): void {
    const current = this.state.selectedEmployee();
    if (current) {
      this.editEmployee.emit(current);
    }
  }

  onClose(): void {
    this.state.selectEmployee(null);
  }

  quickStatusToggle(): void {
    const current = this.state.selectedEmployee();
    if (!current) return;
    const nextStatus = current.status === 'Active' ? 'On Leave' : 'Active';
    this.state.updateEmployee(current.id, { status: nextStatus });
  }

  quickSalaryBump(): void {
    const current = this.state.selectedEmployee();
    if (!current) return;
    const newSalary = current.salary + 5000;
    this.state.updateEmployee(current.id, { salary: newSalary });
  }
}
