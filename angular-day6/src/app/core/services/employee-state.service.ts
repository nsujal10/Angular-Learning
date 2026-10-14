import { Injectable, computed, effect, inject, signal, untracked } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { catchError, concat, debounceTime, distinctUntilChanged, map, of, switchMap } from 'rxjs';
import { CreateEmployeeDto, Department, Employee, INITIAL_EMPLOYEES, UpdateEmployeeDto } from '../models/employee.model';
import { EmployeeApiService } from './employee-api.service';

export interface SearchState {
  data: Employee[];
  loading: boolean;
  error: string | null;
}

export interface BrowserPreference {
  theme: 'dark' | 'light';
  lastSelectedId: number | null;
  lastSearchTerm: string;
  updatedAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class EmployeeStateService {
  private readonly apiService = inject(EmployeeApiService);

  // 1. Private writable signals (Signals Fundamentals & Shared State)
  readonly #employees = signal<Employee[]>([...INITIAL_EMPLOYEES]);
  readonly #searchTerm = signal<string>('');
  readonly #selectedEmployeeId = signal<number | null>(1);
  readonly #selectedDepartment = signal<Department | 'All'>('All');
  readonly #theme = signal<'dark' | 'light'>('dark');
  readonly #activityLogs = signal<string[]>(['Service initialized with default state.']);
  readonly #lastSyncTimestamp = signal<string>(new Date().toLocaleTimeString());

  // 2. Public read-only signals
  readonly employees = this.#employees.asReadonly();
  readonly searchTerm = this.#searchTerm.asReadonly();
  readonly selectedEmployeeId = this.#selectedEmployeeId.asReadonly();
  readonly selectedDepartment = this.#selectedDepartment.asReadonly();
  readonly theme = this.#theme.asReadonly();
  readonly activityLogs = this.#activityLogs.asReadonly();
  readonly lastSyncTimestamp = this.#lastSyncTimestamp.asReadonly();

  // 3. Computed signals (Signals Fundamentals)
  readonly filteredEmployees = computed(() => {
    const list = this.#employees();
    const term = this.#searchTerm().trim().toLowerCase();
    const dept = this.#selectedDepartment();

    return list.filter(emp => {
      const matchesDept = dept === 'All' || emp.department === dept;
      if (!matchesDept) return false;

      if (!term) return true;
      return (
        emp.name.toLowerCase().includes(term) ||
        emp.role.toLowerCase().includes(term) ||
        emp.email.toLowerCase().includes(term) ||
        emp.department.toLowerCase().includes(term) ||
        emp.skills.some(skill => skill.toLowerCase().includes(term))
      );
    });
  });

  readonly employeeCount = computed(() => this.filteredEmployees().length);
  readonly totalCount = computed(() => this.#employees().length);

  readonly selectedEmployee = computed(() => {
    const id = this.#selectedEmployeeId();
    if (id === null) return null;
    return this.#employees().find(e => e.id === id) || null;
  });

  readonly departmentStats = computed(() => {
    const list = this.#employees();
    const counts: Record<string, number> = {
      Engineering: 0,
      Design: 0,
      Product: 0,
      Marketing: 0,
      Operations: 0
    };
    list.forEach(emp => {
      if (counts[emp.department] !== undefined) {
        counts[emp.department]++;
      }
    });
    return counts;
  });

  // 4. Connect search to an API using toObservable(), debounceTime() and switchMap()
  // 5. Use toSignal() to expose the latest results and handle loading/error states
  private readonly searchResult$ = toObservable(this.#searchTerm).pipe(
    debounceTime(300),
    distinctUntilChanged(),
    switchMap(term => {
      return concat(
        of<SearchState>({ data: [], loading: true, error: null }),
        this.apiService.searchEmployees(term).pipe(
          map(data => ({ data, loading: false, error: null })),
          catchError(err =>
            of<SearchState>({
              data: [],
              loading: false,
              error: err.message || 'Live search encountered an error'
            })
          )
        )
      );
    })
  );

  private readonly initialSearchState: SearchState = {
    data: [...INITIAL_EMPLOYEES],
    loading: false,
    error: null
  };

  readonly searchApiState = toSignal(this.searchResult$, {
    initialValue: this.initialSearchState
  });

  constructor() {
    this.restorePreference();

    // Effect: Logs meaningful state change and synchronizes browser preference
    effect(
      () => {
        const theme = this.#theme();
        const selectedId = this.#selectedEmployeeId();
        const term = this.#searchTerm();
        const selected = this.selectedEmployee();
        const count = this.employeeCount();

        // Synchronize browser preference into localStorage
        const preference: BrowserPreference = {
          theme,
          lastSelectedId: selectedId,
          lastSearchTerm: term,
          updatedAt: new Date().toISOString()
        };

        try {
          if (typeof window !== 'undefined' && window.localStorage) {
            localStorage.setItem('employee_dashboard_pref', JSON.stringify(preference));
          }
        } catch {
          // Fallback if localStorage is disabled
        }

        // Meaningful state change message
        const message = selected
          ? `[Sync Effect] Selected: "${selected.name}" (${selected.role}) | Department: ${selected.department} | ${count} match query.`
          : `[Sync Effect] No selection | Active filter: "${term || 'None'}" | Count: ${count}`;

        const time = new Date().toLocaleTimeString();

        untracked(() => {
          this.#lastSyncTimestamp.set(time);
          this.#activityLogs.update(logs => [
            `[${time}] ${message}`,
            ...logs.slice(0, 14)
          ]);
        });
      },
      { allowSignalWrites: true }
    );
  }

  // 6. State Mutation Methods using set() and update() (immutable changes)

  setSearchTerm(term: string): void {
    this.#searchTerm.set(term);
  }

  setSelectedDepartment(dept: Department | 'All'): void {
    this.#selectedDepartment.set(dept);
  }

  selectEmployee(id: number | null): void {
    this.#selectedEmployeeId.set(id);
  }

  toggleTheme(): void {
    this.#theme.update(current => (current === 'dark' ? 'light' : 'dark'));
  }

  createEmployee(dto: CreateEmployeeDto): Employee {
    const currentList = this.#employees();
    const nextId = currentList.length > 0 ? Math.max(...currentList.map(e => e.id)) + 1 : 1;
    const newEmployee: Employee = {
      ...dto,
      id: nextId
    };

    // Immutable update() with new array reference
    this.#employees.update(list => [...list, newEmployee]);
    // Automatically select the newly created employee
    this.#selectedEmployeeId.set(nextId);

    return newEmployee;
  }

  updateEmployee(id: number, dto: UpdateEmployeeDto): void {
    // Immutable update() mapping over list
    this.#employees.update(list =>
      list.map(emp => (emp.id === id ? { ...emp, ...dto } : emp))
    );
  }

  deleteEmployee(id: number): void {
    // Immutable update() filtering list
    this.#employees.update(list => list.filter(emp => emp.id !== id));

    // If deleted employee was selected, clear selection
    if (this.#selectedEmployeeId() === id) {
      this.#selectedEmployeeId.set(null);
    }
  }

  resetState(): void {
    this.#employees.set([...INITIAL_EMPLOYEES]);
    this.#searchTerm.set('');
    this.#selectedDepartment.set('All');
    this.#selectedEmployeeId.set(1);
    this.#activityLogs.update(logs => [
      `[${new Date().toLocaleTimeString()}] State reset to default demo values.`,
      ...logs
    ]);
  }

  clearLogs(): void {
    this.#activityLogs.set([]);
  }

  private restorePreference(): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const raw = localStorage.getItem('employee_dashboard_pref');
        if (raw) {
          const pref = JSON.parse(raw) as BrowserPreference;
          if (pref.theme === 'dark' || pref.theme === 'light') {
            this.#theme.set(pref.theme);
          }
          if (typeof pref.lastSelectedId === 'number') {
            const exists = this.#employees().some(e => e.id === pref.lastSelectedId);
            if (exists) {
              this.#selectedEmployeeId.set(pref.lastSelectedId);
            }
          }
        }
      }
    } catch {
      // Ignored
    }
  }
}
