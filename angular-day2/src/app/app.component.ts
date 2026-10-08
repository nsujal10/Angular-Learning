import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EmployeeDashboardComponent } from './features/employees/employee-dashboard/employee-dashboard';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, EmployeeDashboardComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {}
