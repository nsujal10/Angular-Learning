# PulseHR — Enterprise Employee Management Portal (Angular Day 7)

A full-stack, enterprise-grade Employee Management Portal combining **Standalone Angular 17** with an **ASP.NET Core Web API** backend.

---

## 🏛️ Target Architecture Overview

```
                      ┌────────────────────────────────────────┐
                      │    Standalone Angular 17 Portal        │
                      │ (bootstrapApplication · app.config.ts) │
                      └──────────────────┬─────────────────────┘
                                         │
        ┌────────────────────────────────┼────────────────────────────────┐
        ▼                                ▼                                ▼
┌─────────────────┐            ┌───────────────────┐            ┌──────────────────┐
│   Core Layout   │            │     Dashboard     │            │    Employees     │
│ Sidebar/Toolbar │            │ KPIs/Charts/Meters│            │ List/Details/Form│
│ RouterOutlet    │            │ Recent Hire Table │            │ MatTable/Filters │
│ Functional Guard│            └───────────────────┘            └──────────────────┘
└───────┬─────────┘                                                       │
        │                                                                 │
        └────────────────────────┬────────────────────────────────────────┘
                                 │
                   ┌─────────────▼──────────────┐
                   │    Signals & API Service   │
                   │  (EmployeeApiService +     │
                   │   AuthInterceptor Bearer)  │
                   └─────────────┬──────────────┘
                                 │ HTTP (REST + JWT)
                   ┌─────────────▼──────────────┐
                   │   ASP.NET Core Web API     │
                   │ Controllers · Auth · CORS  │
                   │  EF Core · Seed Provider   │
                   └────────────────────────────┘
```

---

## 📂 Project Organization

```text
angular-day7/
├── employee-portal/                      # Frontend (Angular 17 Standalone)
│   ├── src/app/
│   │   ├── app.config.ts                 # Application providers (Router, HttpClient, Animations)
│   │   ├── app.routes.ts                 # Root routes, guards, and lazy loading
│   │   ├── core/
│   │   │   ├── guards/
│   │   │   │   └── auth.guard.ts         # Functional CanActivateFn guard
│   │   │   ├── interceptors/
│   │   │   │   └── auth.interceptor.ts   # Functional HttpInterceptorFn (Bearer token injection)
│   │   │   ├── layout/
│   │   │   │   └── main-layout/          # MatSidenav, MatToolbar, User Profile, Links
│   │   │   ├── models/
│   │   │   │   ├── employee.model.ts     # TypeScript interfaces for Employee and Dashboard
│   │   │   │   └── user.model.ts         # Auth and User profile contracts
│   │   │   ├── resolvers/
│   │   │   │   └── employee.resolver.ts  # Route resolver for instantaneous profile hydration
│   │   │   └── services/
│   │   │       └── auth.service.ts       # Signal-based auth state & session storage
│   │   └── features/
│   │       ├── auth/login/               # Secure authentication page with demo presets
│   │       ├── dashboard/dashboard/      # KPI cards, distribution meters, recent hires
│   │       ├── employees/
│   │       │   ├── data-access/          # EmployeeApiService with Angular Signals & HTTP
│   │       │   ├── pages/
│   │       │   │   ├── employee-list/    # MatTable, Search debounce, Department/Status filters
│   │       │   │   ├── employee-details/ # Dynamic profile view with performance breakdown
│   │       │   │   └── employee-form/    # Reactive form with cross-field validation
│   │       │   └── employees.routes.ts   # Lazy-loaded feature routes
│   │       └── not-found/                # 404 Wildcard fallback page
│   └── src/styles.scss                   # Global Material theme & custom glassmorphism tokens
│
└── EmployeeManagement.Api/               # Backend (ASP.NET Core Web API)
    ├── Controllers/
    │   ├── AuthController.cs             # Login endpoint issuing JWT tokens
    │   └── EmployeesController.cs        # CRUD, Search, Filter & Dashboard metrics
    ├── Data/
    │   └── AppDbContext.cs               # EF Core context & rich workforce seed data
    ├── DTOs/
    │   └── EmployeeDtos.cs               # Data Transfer Objects with validation annotations
    ├── Models/
    │   ├── Employee.cs                   # Employee domain entity
    │   └── User.cs                       # User identity entity
    ├── Program.cs                        # WebApplication pipeline (CORS, JWT, EF Core)
    └── appsettings.json                  # Connection strings & JWT secret configuration
```

---

## 🚀 Running the Project

### 1. Start the ASP.NET Core Web API (Backend)
Open a terminal in `angular-day7/EmployeeManagement.Api`:
```bash
cd angular-day7/EmployeeManagement.Api
dotnet run
```
* **API URL**: `http://localhost:5000` or `https://localhost:5001`
* **Swagger/OpenAPI**: Available in development mode

### 2. Start the Angular Employee Portal (Frontend)
Open another terminal in `angular-day7/employee-portal`:
```bash
cd angular-day7/employee-portal
npm start
```
* **Client URL**: `http://localhost:4200`

---

## 🔑 Demo Credentials
* **Username**: `admin`
* **Password**: `admin123`
*(Pre-loaded directly on the sign-in form for convenience)*
