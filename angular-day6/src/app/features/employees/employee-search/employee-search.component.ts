import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { EmployeeApiService } from '../../../core/services/employee-api.service';
import { EmployeeStateService } from '../../../core/services/employee-state.service';

@Component({
  selector: 'app-employee-search',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './employee-search.component.html',
  styleUrl: './employee-search.component.css'
})
export class EmployeeSearchComponent {
  readonly state = inject(EmployeeStateService);
  readonly apiService = inject(EmployeeApiService);

  isSimulatedFailureActive(): boolean {
    return this.apiService.isSimulateFailureActive();
  }

  toggleSimulatedFailure(): void {
    const nextState = !this.apiService.isSimulateFailureActive();
    this.apiService.setSimulateFailure(nextState);
    // Trigger a search update to see error state immediately
    this.state.setSearchTerm(this.state.searchTerm());
  }

  onSearchInput(val: string): void {
    this.state.setSearchTerm(val);
  }

  clearSearch(): void {
    this.state.setSearchTerm('');
  }

  clearLogs(): void {
    this.state.clearLogs();
  }
}
