import { Component, DestroyRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  BehaviorSubject,
  Observable,
  catchError,
  debounceTime,
  distinctUntilChanged,
  finalize,
  map,
  of,
  startWith,
  switchMap,
  tap
} from 'rxjs';
import { Employee, EmployeeApiService } from '../../core/services/employee-api.service';

/**
 * Step 4 Production State Interface:
 * Eliminates race conditions with a shared mutable boolean by binding
 * loading state directly to the active switchMap stream.
 */
export interface SearchState {
  status: 'idle' | 'loading' | 'success' | 'error';
  employees: Employee[];
  errorMessage?: string;
  searchTerm?: string;
}

@Component({
  selector: 'app-employee-search',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './employee-search.component.html',
  styleUrls: ['./employee-search.component.css']
})
export class EmployeeSearchComponent {
  private readonly api = inject(EmployeeApiService);
  private readonly destroyRef = inject(DestroyRef);

  readonly searchControl = new FormControl('', {
    nonNullable: true
  });

  // Step 2 Core Properties
  employees: Employee[] = [];
  loading = false;
  errorMessage = '';

  private readonly resultsSubject = new BehaviorSubject<Employee[]>([]);
  readonly results$ = this.resultsSubject.asObservable();

  // Step 4 Production State Observable (Observable-First Architecture)
  readonly searchState$: Observable<SearchState>;

  // Pipeline telemetry & educational metrics
  keystrokeCount = 0;
  apiRequestsDispatched = 0;
  cancelledRequests = 0;
  lastExecutedTerm = '';

  // Simulation controls
  simulateError = false;
  debounceInterval = 300;
  simulatedServerDelay = 350;

  constructor() {
    // -------------------------------------------------------------------------
    // Step 2 & 4: RxJS Search Pipeline
    // -------------------------------------------------------------------------
    this.searchState$ = this.searchControl.valueChanges.pipe(
      startWith(this.searchControl.value),
      tap(() => {
        this.keystrokeCount++;
      }),
      // Step 4 Pipeline Stage 1: Wait for 300ms pause after typing
      debounceTime(this.debounceInterval),
      // Step 4 Pipeline Stage 2: Skip consecutive identical queries
      distinctUntilChanged(),
      tap((term) => {
        this.apiRequestsDispatched++;
        this.lastExecutedTerm = term;
        this.loading = true;
        this.errorMessage = '';
      }),
      // Step 4 Pipeline Stage 3: switchMap switches to latest search and cancels in-flight
      switchMap((term) => {
        const trimmed = term.trim();

        // Model loading state inside the inner Observable so cancelled requests
        // never leave a stale loading flag
        return this.api.searchEmployees(trimmed, this.simulateError, this.simulatedServerDelay).pipe(
          map((employees) => ({
            status: 'success' as const,
            employees,
            searchTerm: trimmed
          })),
          startWith<SearchState>({
            status: 'loading' as const,
            employees: [],
            searchTerm: trimmed
          }),
          catchError((error) => {
            console.error('Employee search failed', error);
            this.errorMessage = 'Unable to load employees. Try again.';
            return of<SearchState>({
              status: 'error' as const,
              employees: [],
              errorMessage: 'Unable to load employees. Try again.',
              searchTerm: trimmed
            });
          }),
          finalize(() => {
            this.loading = false;
          })
        );
      }),
      takeUntilDestroyed(this.destroyRef)
    );

    // Sync pipeline results with local component properties for Step 3 template bindings
    this.searchState$.subscribe((state) => {
      this.employees = state.employees;
      this.loading = state.status === 'loading';
      this.errorMessage = state.errorMessage || '';
      this.resultsSubject.next(state.employees);
    });
  }

  // Quick Preset Filters
  setSearchTerm(term: string): void {
    this.searchControl.setValue(term);
  }

  clearSearch(): void {
    this.searchControl.setValue('');
  }

  toggleSimulateError(): void {
    this.simulateError = !this.simulateError;
    // Re-trigger current search to test error handling
    this.searchControl.setValue(this.searchControl.value);
  }
}
