import { Component, input, output, OnInit, AfterViewInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Employee } from '../../../core/models/employee.model';
import { CardComponent } from '../../../shared/card/card';
import { LifecycleLoggerService } from '../../../core/services/lifecycle-logger.service';

@Component({
  selector: 'app-employee-details',
  standalone: true,
  imports: [CommonModule, CardComponent],
  templateUrl: './employee-details.html',
  styleUrl: './employee-details.css'
})
export class EmployeeDetailsComponent implements OnInit, AfterViewInit, OnDestroy {
  private logger = inject(LifecycleLoggerService);

  employee = input<Employee | null>(null);
  closed = output<void>();
  statusToggled = output<number>();
  deleted = output<number>();

  ngOnInit(): void {
    console.log('EmployeeDetails initialized');
    this.logger.log('EmployeeDetails', 'OnInit');
  }

  ngAfterViewInit(): void {
    console.log('EmployeeDetails view initialized');
    this.logger.log('EmployeeDetails', 'AfterViewInit');
  }

  ngOnDestroy(): void {
    console.log('EmployeeDetails destroyed');
    this.logger.log('EmployeeDetails', 'OnDestroy');
  }

  close(): void {
    this.closed.emit();
  }

  toggleStatus(id: number): void {
    this.statusToggled.emit(id);
  }

  remove(id: number): void {
    this.deleted.emit(id);
  }
}
