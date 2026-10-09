# SpikeHR • Employee Management Portal v3 (Day 3 Hands-On Project)

A production-grade, enterprise-ready Angular 17 SaaS Workforce Management application combining advanced routing, functional guards, route resolvers, and complex reactive forms.

---

## 🚀 Quick Start

From the root or project directory:
```bash
cd angular-day3
npm start
```
The app will launch at `http://localhost:4200/`.

---

## 📋 Implementation Checklist: 21 / 21 Completed

### 1. Routing
- [x] **Dashboard, Employees, Login, and Settings routes**: Defined in [app.routes.ts](file:///d:/Projects/Angular%20Learning/angular-day3/src/app/app.routes.ts).
- [x] **Employee details using `/employees/:id`**: Dedicated profile view displaying skills, compensation, and managerial reports.
- [x] **Edit route using `/employees/:id/edit`**: Reusable reactive form populated in edit mode.
- [x] **Query parameters for search, filtering, and pagination**: Two-way synced between UI inputs and browser URL (`?search=...&department=...&status=...&page=...`).
- [x] **Nested employee layout with child routes**: [EmployeeLayoutComponent](file:///d:/Projects/Angular%20Learning/angular-day3/src/app/features/employees/employee-layout/employee-layout.component.ts) with child routes and nested `<router-outlet>`.
- [x] **Lazy loading using `loadComponent` / `loadChildren`**: All routes lazy loaded into standalone chunks.

### 2. Guards & Resolvers
- [x] **Authentication guard (`authGuard`)**: Enforces session login and preserves intended `returnUrl`.
- [x] **Admin-only route guard (`adminGuard`)**: Protects `/settings` and sensitive actions.
- [x] **Unsaved changes guard (`unsavedChangesGuard`)**: Prompts user confirmation if navigating away from a dirty form.
- [x] **Route resolver (`employeeResolver`)**: Pre-fetches employee profile data before route activation.

### 3. Reactive Forms
- [x] **Employee create form with Reactive Forms**: Built with `FormBuilder` and strict typing.
- [x] **Edit form populated using `patchValue()`**: Safely populates fields and skills upon entering edit mode.
- [x] **Required, email, length, and numeric validation**: Full suite of standard validators.
- [x] **Custom validator**:
  - `corporateEmail`: Enforces `@spikeoffice.io` domain.
  - `humanName`: Disallows numbers or special characters.
- [x] **Cross-field validation**:
  - `departmentSalaryBenchmark`: Compares salary against department minimum threshold.
  - `managerTeamSize`: Enforces minimum 1 report when `isManager` is true.
- [x] **Dynamic skills using `FormArray`**: Add, view, and remove skills with validation.
- [x] **Conditional manager-only fields**: Toggling `isManager` enables/disables `teamSize` and `managerBonus` dynamically with `setValidators` and `updateValueAndValidity`.

### 4. Quality & UX
- [x] **Display validation messages**: Granular inline feedback and prominent cross-field banners.
- [x] **Disable invalid form submission**: Button disabled and submission blocked when invalid.
- [x] **Show success/error feedback**: Floating [NotificationService](file:///d:/Projects/Angular%20Learning/angular-day3/src/app/core/services/notification.service.ts) toast alerts.
- [x] **Interactive Guard Tester**: Live role switcher directly in top navbar to simulate Admin, Manager, and Employee permissions on the fly.
