import { Component } from '@angular/core';
import { EmployeeDashboardComponent } from './features/employees/employee-dashboard/employee-dashboard.component';

/**
 * Root Application Component
 * 
 * In Angular 17+, root components are standalone by default.
 * Here we import and render our EmployeeDashboardComponent.
 */
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [EmployeeDashboardComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'Employee Dashboard - Day 1';
}
