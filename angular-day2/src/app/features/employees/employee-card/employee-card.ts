import { Component, input, output, OnInit, AfterViewInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Employee } from '../../../core/models/employee.model';
import { CardComponent } from '../../../shared/card/card';
import { LifecycleLoggerService } from '../../../core/services/lifecycle-logger.service';

@Component({
  selector: 'app-employee-card',
  standalone: true,
  imports: [CommonModule, CardComponent],
  templateUrl: './employee-card.html',
  styleUrl: './employee-card.css'
})
export class EmployeeCardComponent implements OnInit, AfterViewInit, OnDestroy {
  private logger = inject(LifecycleLoggerService);

  employee = input.required<Employee>();
  selected = output<Employee>();
  deleted = output<number>();
  statusToggled = output<number>();

  ngOnInit(): void {
    console.log('EmployeeCard initialized');
    this.logger.log(`EmployeeCard (#${this.employee().id} ${this.employee().name})`, 'OnInit');
  }

  ngAfterViewInit(): void {
    console.log('EmployeeCard view initialized');
    this.logger.log(`EmployeeCard (#${this.employee().id} ${this.employee().name})`, 'AfterViewInit');
  }

  ngOnDestroy(): void {
    console.log('EmployeeCard destroyed');
    this.logger.log(`EmployeeCard (#${this.employee().id} ${this.employee().name})`, 'OnDestroy');
  }

  selectEmployee(employee: Employee): void {
    this.selected.emit(employee);
  }

  onDelete(id: number, event: Event): void {
    event.stopPropagation();
    this.deleted.emit(id);
  }

  onToggleStatus(id: number, event: Event): void {
    event.stopPropagation();
    this.statusToggled.emit(id);
  }
}
