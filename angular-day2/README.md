# 🚀 Angular Day 2: Employee Management UI v2

Welcome to **Day 2 Hands-On Project**! In this project, we upgraded the Employee Dashboard to an enterprise-grade, decoupled component architecture powered by Angular 17+ Modern Signals, Input/Output APIs, Multi-Slot Content Projection, Lifecycle Hooks, and Service Dependency Injection.

---

## 📁 Component Architecture (Step 41)

```text
src/app/
├── core/
│   ├── models/
│   │   └── employee.model.ts
│   └── services/
│       ├── employee.service.ts
│       └── lifecycle-logger.service.ts
│
├── shared/
│   └── card/
│       ├── card.ts
│       ├── card.html
│       └── card.css
│
└── features/employees/
    ├── employee-dashboard/
    │   ├── employee-dashboard.ts
    │   ├── employee-dashboard.html
    │   └── employee-dashboard.css
    │
    ├── employee-list/
    │   ├── employee-list.ts
    │   ├── employee-list.html
    │   └── employee-list.css
    │
    ├── employee-card/
    │   ├── employee-card.ts
    │   ├── employee-card.html
    │   └── employee-card.css
    │
    ├── employee-details/
    │   ├── employee-details.ts
    │   ├── employee-details.html
    │   └── employee-details.css
    │
    └── employee-search/
        ├── employee-search.ts
        ├── employee-search.html
        └── employee-search.css
```

---

## 🔄 Data Flow & Communication Patterns

### 1. Parent ➔ Child Communication (Step 42)
- **Dashboard ➔ List**:
  ```html
  <app-employee-list [employees]="filteredEmployees()">
  </app-employee-list>
  ```
- **List ➔ Card**:
  ```typescript
  employees = input.required<Employee[]>();
  ```
  ```html
  @for (employee of employees(); track employee.id) {
    <app-employee-card [employee]="employee" (selected)="onEmployeeSelected($event)">
    </app-employee-card>
  }
  ```

### 2. Child ➔ Parent Communication (Step 43)
- **Card**:
  ```typescript
  selected = output<Employee>();
  selectEmployee(employee: Employee) {
    this.selected.emit(employee);
  }
  ```
  ```html
  <button (click)="selectEmployee(employee())">View Details</button>
  ```
- **List Forwarding**:
  ```typescript
  selected = output<Employee>();
  onEmployeeSelected(employee: Employee) {
    this.selected.emit(employee);
  }
  ```

### 3. Details Selection Pipeline (Step 44)
```text
EmployeeCard
     ↓ (selected event)
EmployeeList
     ↓ (selected event)
EmployeeDashboard
     ↓ (selectedEmployee signal)
EmployeeDetails
```
**Details Component Displays:**
- Name
- Email
- Department
- Role
- Salary
- Status (Active / Inactive)

---

## 🧩 Reusable Card with Multi-Slot Projection (Step 45)

`app-card` provides layout encapsulation with 3 projection zones:
```html
<div class="card">
  <div class="card-header">
    <ng-content select="[header]"></ng-content>
  </div>

  <div class="card-body">
    <ng-content></ng-content>
  </div>

  <div class="card-footer">
    <ng-content select="[footer]"></ng-content>
  </div>
</div>
```

**Usage in `employee-card` & `employee-details`:**
```html
<app-card>
  <div header>
    Employee Information
  </div>

  <p>{{ employee.name }}</p>
  <p>{{ employee.role }}</p>

  <button footer>
    Edit
  </button>
</app-card>
```

---

## ⚡ Lifecycle Hook Logging (Step 46)

Implemented across `EmployeeCard`, `EmployeeList`, and `EmployeeDashboard`:
```typescript
ngOnInit() {
  console.log('EmployeeCard initialized');
}

ngAfterViewInit() {
  console.log('EmployeeCard view initialized');
}

ngOnDestroy() {
  console.log('EmployeeCard destroyed');
}
```

### Observation Steps:
1. Open the page and open DevTools Console (`F12`).
2. Add new employees ➔ Watch `ngOnInit` and `ngAfterViewInit` fire on the new `EmployeeCard`.
3. Filter or remove employees ➔ Watch `ngOnDestroy` fire on the removed `EmployeeCard`.
4. An on-screen Live Lifecycle Inspector terminal also displays hooks in real-time.

---

## 🛠️ EmployeeService (Step 47)

```typescript
@Injectable({
  providedIn: 'root'
})
export class EmployeeService {
  private employees: Employee[] = [ ... ];

  getEmployees(): Employee[] { ... }
  getEmployeeById(id: number): Employee | undefined { ... }
  addEmployee(...): Employee { ... }
  removeEmployee(id: number): void { ... }
  toggleActiveStatus(id: number): void { ... }
}
```

Injected into `EmployeeDashboard`:
```typescript
private employeeService = inject(EmployeeService);
employees = this.employeeService.getEmployees();
```

---

## 🏛️ Architecture Exercise: Component State vs. Service (Step 48)

| Dimension | State in `EmployeeDashboard` (Anti-pattern) | State in `EmployeeService` (Best Practice) |
| :--- | :--- | :--- |
| **Testing** | Hard. Requires instantiating the entire DOM tree and component fixture. | Easy. Service can be unit-tested in isolation, or easily mocked in component tests. |
| **Reusability** | None. State is trapped in the dashboard view. | High. Any component (Org Chart, Reports, Payroll) can inject `EmployeeService`. |
| **API Logic** | Clutters presentation components with HTTP calls, interceptors, and error handling. | Clean separation: API and business logic live in the service layer, keeping UI pure. |

---

## 🚀 Running the Project

From the `angular-day2` directory:
```bash
npm start
```
Visit `http://localhost:4200` to view the application.
