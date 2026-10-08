import { Component, input, output, OnInit, AfterViewInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Employee } from '../../../core/models/employee.model';
import { EmployeeCardComponent } from '../employee-card/employee-card';
import { LifecycleLoggerService } from '../../../core/services/lifecycle-logger.service';

@Component({
  selector: 'app-employee-list',
  standalone: true,
  imports: [CommonModule, EmployeeCardComponent],
  templateUrl: './employee-list.html',
  styleUrl: './employee-list.css'
})
export class EmployeeListComponent implements OnInit, AfterViewInit, OnDestroy {
  private logger = inject(LifecycleLoggerService);

  employees = input.required<Employee[]>();

  selected = output<Employee>();
  deleted = output<number>();
  statusToggled = output<number>();

  ngOnInit(): void {
    console.log('EmployeeList initialized');
    this.logger.log('EmployeeList', 'OnInit');
  }

  ngAfterViewInit(): void {
    console.log('EmployeeList view initialized');
    this.logger.log('EmployeeList', 'AfterViewInit');
  }

  ngOnDestroy(): void {
    console.log('EmployeeList destroyed');
    this.logger.log('EmployeeList', 'OnDestroy');
  }

  onEmployeeSelected(employee: Employee): void {
    this.selected.emit(employee);
  }

  onEmployeeDeleted(id: number): void {
    this.deleted.emit(id);
  }

  onStatusToggled(id: number): void {
    this.statusToggled.emit(id);
  }
}
