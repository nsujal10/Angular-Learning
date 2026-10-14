# Angular Day 6 — Employee Management Dashboard

A modern, production-grade **Employee Management Dashboard** built with **Angular 17**, showcasing **Angular Signals**, **RxJS interoperability**, **Shared Application State Architecture**, and **NgRx Redux Fundamentals** side-by-side with 100% test coverage.

---

## 📋 Day 6 Practical Assignment Checklist (16 / 16 Completed)

### 1. Signals Fundamentals
- [x] **Create writable signals for employees, search term and selected employee ID.**
  - Implemented in [`src/app/core/services/employee-state.service.ts`](file:///d:/Projects/Angular%20Learning/angular-day6/src/app/core/services/employee-state.service.ts) using `#employees = signal<Employee[]>(...)`, `#searchTerm = signal<string>('')`, and `#selectedEmployeeId = signal<number | null>(1)`.
- [x] **Use `set()` and `update()` for immutable changes.**
  - `set()` is utilized in `setSearchTerm()`, `selectEmployee()`, and `resetState()`.
  - `update()` is utilized in `createEmployee()`, `updateEmployee()`, `deleteEmployee()`, and `toggleTheme()` to produce fresh immutable array/object references.
- [x] **Use `computed()` for filtered employees, employee count and selected employee.**
  - `filteredEmployees = computed(...)`: Multi-field filter across names, roles, departments, skills, and email.
  - `employeeCount = computed(...)`: Reactive count of currently matching employees.
  - `totalCount = computed(...)`: Total active team count.
  - `selectedEmployee = computed(...)`: Reactive projection of the active employee based on `#selectedEmployeeId()`.
  - `departmentStats = computed(...)`: Aggregates headcount distribution across departments.

### 2. Effects and RxJS Interoperability
- [x] **Create an effect that logs a meaningful state change or synchronizes a browser preference.**
  - An `effect()` in `EmployeeStateService` automatically synchronizes the theme, last selected employee ID, and search query to `localStorage['employee_dashboard_pref']` and logs timestamped state change messages into `activityLogs()`.
- [x] **Connect search to an API using `toObservable()`, `debounceTime()` and `switchMap()`.**
  - Search stream converts `#searchTerm` into an Observable via `toObservable()`, debounces by 300ms, eliminates duplicates with `distinctUntilChanged()`, and cancels obsolete in-flight requests using `switchMap()`.
- [x] **Use `toSignal()` to expose the latest results and handle loading/error states.**
  - Exposes `searchApiState = toSignal(...)` providing `{ data: Employee[], loading: boolean, error: string | null }`, cleanly consumed in the UI without manual subscriptions.

### 3. Shared Application State
- [x] **Create an `EmployeeStateService` with private writable signals and public read-only signals.**
  - Uses ECMAScript `#` private signals (`#employees`, `#searchTerm`, `#selectedEmployeeId`) exposed via public `asReadonly()` accessors (`employees`, `searchTerm`, `selectedEmployeeId`).
- [x] **Share employee state between list and details components.**
  - [`EmployeeListComponent`](file:///d:/Projects/Angular%20Learning/angular-day6/src/app/features/employees/employee-list/employee-list.component.ts) and [`EmployeeDetailComponent`](file:///d:/Projects/Angular%20Learning/angular-day6/src/app/features/employees/employee-detail/employee-detail.component.ts) both inject `EmployeeStateService`. Selecting an employee in the list instantly updates the details view.
- [x] **Add create, select, update and delete methods.**
  - Implemented `createEmployee(dto)`, `selectEmployee(id)`, `updateEmployee(id, dto)`, and `deleteEmployee(id)`.

### 4. NgRx Fundamentals
- [x] **Create actions, a reducer and selectors for employees.**
  - Actions: [`src/app/state/employee.actions.ts`](file:///d:/Projects/Angular%20Learning/angular-day6/src/app/state/employee.actions.ts)
  - Reducer: [`src/app/state/employee.reducer.ts`](file:///d:/Projects/Angular%20Learning/angular-day6/src/app/state/employee.reducer.ts)
  - Selectors: [`src/app/state/employee.selectors.ts`](file:///d:/Projects/Angular%20Learning/angular-day6/src/app/state/employee.selectors.ts)
- [x] **Use an effect for API loading and success/failure actions.**
  - [`EmployeeEffects`](file:///d:/Projects/Angular%20Learning/angular-day6/src/app/state/employee.effects.ts) handles `loadEmployees$`, `createEmployee$`, and `deleteEmployee$`, dispatching typed success and failure actions.
- [x] **Register the Store and Effects and display loading, error and result states.**
  - Registered in [`app.config.ts`](file:///d:/Projects/Angular%20Learning/angular-day6/src/app/app.config.ts) with `provideStore({ employees: employeesReducer })` and `provideEffects([EmployeeEffects])`.
  - Visualized in the dedicated **"NgRx Store & Redux Cycle"** dashboard tab displaying loading skeletons, error banners with retry action, and entity results from selectors.

### 5. Testing and Debugging
- [x] **Test computed filtering and immutable updates.**
  - Unit tests in [`src/app/core/services/employee-state.service.spec.ts`](file:///d:/Projects/Angular%20Learning/angular-day6/src/app/core/services/employee-state.service.spec.ts) verify filtering by name, role, skills, department and assert array reference changes upon `createEmployee`, `updateEmployee`, and `deleteEmployee`.
- [x] **Test reducer outputs without making HTTP requests.**
  - Pure unit tests in [`src/app/state/employee.reducer.spec.ts`](file:///d:/Projects/Angular%20Learning/angular-day6/src/app/state/employee.reducer.spec.ts) verify state mutations for all lifecycle actions with zero network requests.
- [x] **Test the effect with a mocked API service.**
  - Unit tests in [`src/app/state/employee.effects.spec.ts`](file:///d:/Projects/Angular%20Learning/angular-day6/src/app/state/employee.effects.spec.ts) test `EmployeeEffects` with `jasmine.createSpyObj` and `provideMockActions()`, asserting success and failure actions.
- [x] **Verify that the service provider scope is correct.**
  - Unit tests in [`src/app/core/services/provider-scope.spec.ts`](file:///d:/Projects/Angular%20Learning/angular-day6/src/app/core/services/provider-scope.spec.ts) verify root singleton behavior across consumer components and isolated child injector instance scoping.

---

## 🚀 Running the Project

### Development Server
```bash
cd angular-day6
npm start
```
Navigate to `http://localhost:4200/`.

### Run Unit Tests
```bash
npm test -- --watch=false --browsers=ChromeHeadless
```
Result: **34/34 passing tests** across Signals, RxJS, NgRx, and Provider scopes.

### Production Build
```bash
npm run build
```
Generates optimized output in `dist/angular-day6`.
