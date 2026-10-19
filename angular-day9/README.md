# Day 9 Hands-on Project: Enterprise Employee Portal

A robust, enterprise-grade Employee Portal demonstrating advanced security, accessibility, internationalization, real-time communication, and resilient error recovery patterns built with **Angular 17+ Standalone Components**.

---

## 📋 Practical Checklist (8 of 8 Completed)

| Status | Topic | Implementation Details |
| :---: | :--- | :--- |
| ✅ | **Security** | Configured trusted API origins whitelist in `app-config.ts`. Implemented `AuthService` with JWT tokens, session persistence, role switching (`Admin`, `Manager`, `Employee`), permission checks, `authGuard` and `roleGuard` (CanActivateFn) route protection. |
| ✅ | **XSS & CSRF** | Safe rendering of untrusted content using Angular interpolation auto-escaping and custom `SafeHtmlPipe` with `DomSanitizer.sanitize(SecurityContext.HTML)`. Implemented synchronized anti-CSRF token defense attached via `authInterceptor` to state-mutating requests (`POST`, `PUT`, `DELETE`). |
| ✅ | **Accessibility (a11y)** | Built a keyboard-accessible form in `EmployeeFormComponent` with explicit `<label for="...">` matching inputs, `aria-required`, `aria-invalid`, `aria-describedby` error bindings, WCAG-compliant visible focus rings (`:focus-visible`), and screen-reader announcements via `A11yAnnouncerService`. |
| ✅ | **Internationalization (i18n)** | Multi-locale architecture supporting 3 locales (`en-US`, `es-ES`, `de-DE`) managed by `I18nService`. Includes reactive translations dictionary, `LocalizedDatePipe` (using `Intl.DateTimeFormat`), and `LocalizedCurrencyPipe` (using `Intl.NumberFormat`). |
| ✅ | **Real-time updates** | Persistent SignalR / WebSocket protocol simulator in `RealtimeService` managing connection lifecycles (`Connecting`, `Connected`, `Reconnecting`, `Disconnected`) with exponential backoff auto-reconnection, heartbeat monitoring, and live notification streams. |
| ✅ | **File upload** | Upload PDF documents in `FileService` and `FilePortalComponent` with live progress bars, client-side MIME/size validation (5MB max), and server-side binary validation scanning PDF header signature (`%PDF-`). |
| ✅ | **File download** | Role-authorized corporate report downloads with permission checks (e.g. `Admin` confidential report denied to `Employee` with HTTP 403 Forbidden). Generates Blobs with `responseType: 'blob'`, dynamic filenames, and clean `URL.revokeObjectURL()` memory management. |
| ✅ | **Error handling** | Functional HTTP `errorInterceptor` with user-friendly alerts for 401 Unauthorized, 403 Forbidden, 404 Not Found, 500 Server Error, and Network Offline. Includes interactive Error Lab with loading spinners, skeleton states, and exponential retry mechanisms. |

---

## 🏗️ Project Architecture

```
angular-day9/
├── src/
│   ├── app/
│   │   ├── core/
│   │   │   ├── config/
│   │   │   │   └── app-config.ts                # Trusted API origins & tokens
│   │   │   ├── models/
│   │   │   │   ├── auth.model.ts                # User, Roles, Permissions, Session
│   │   │   │   ├── employee.model.ts            # Employee entity & departments
│   │   │   │   ├── notification.model.ts        # Real-time event & connection models
│   │   │   │   └── i18n.model.ts                # Locales & translation schemas
│   │   │   ├── services/
│   │   │   │   ├── auth.service.ts              # Authentication & RBAC permissions
│   │   │   │   ├── security.service.ts          # Origin validation, XSS scanner, CSRF check
│   │   │   │   ├── a11y-announcer.service.ts    # Screen-reader live announcer (aria-live)
│   │   │   │   ├── i18n.service.ts              # Multi-locale management & formatters
│   │   │   │   ├── realtime.service.ts          # Resilient SignalR/WebSocket auto-reconnect
│   │   │   │   ├── file.service.ts              # PDF upload with progress & authorized downloads
│   │   │   │   └── notification.service.ts      # Global toast & retry notification service
│   │   │   ├── interceptors/
│   │   │   │   ├── auth.interceptor.ts          # Injects Bearer token & Anti-CSRF header
│   │   │   │   └── error.interceptor.ts         # Handles 401, 403, 500, network offline & retries
│   │   │   ├── guards/
│   │   │   │   ├── auth.guard.ts                # Authenticated session route protection
│   │   │   │   └── role.guard.ts                # Role-based route authorization
│   │   │   └── pipes/
│   │   │       ├── safe-html.pipe.ts            # Sanitizes HTML with DomSanitizer
│   │   │       ├── localized-date.pipe.ts       # Format dates by active locale
│   │   │       └── localized-currency.pipe.ts   # Format currencies by active locale
│   │   ├── features/
│   │   │   ├── auth/
│   │   │   │   └── login.component.ts           # Accessible login & quick persona switcher
│   │   │   ├── dashboard/
│   │   │   │   └── portal-dashboard.component.ts # Overview dashboard connecting all modules
│   │   │   ├── employees/
│   │   │   │   └── employee-form.component.ts   # Accessible WCAG form with ARIA & live feedback
│   │   │   ├── security-xss/
│   │   │   │   └── security-demo.component.ts   # Interactive XSS, CSRF & Origin console
│   │   │   ├── files/
│   │   │   │   └── file-portal.component.ts     # PDF upload progress & authorized download
│   │   │   ├── realtime/
│   │   │   │   └── notification-center.component.ts # SignalR hub & reconnect controls
│   │   │   └── error-lab/
│   │   │       └── error-lab.component.ts       # HTTP error status simulator & retry lab
│   │   ├── app.component.ts                     # Shell navigation & global notifications
│   │   ├── app.component.html
│   │   ├── app.component.scss
│   │   ├── app.config.ts                        # ApplicationConfig registering interceptors
│   │   └── app.routes.ts                        # Guarded lazy standalone routes
│   ├── index.html                               # Accessible & SEO configured root
│   ├── main.ts                                  # Standalone bootstrap
│   └── styles.scss                              # Theme variables & WCAG :focus-visible rules
├── package.json
└── README.md
```

---

## ⚡ Key Highlights & Concepts Applied

### 1. Security & Trusted Origins
- Interceptor verifies requests against `trustedApiOrigins` before appending credentials:
  ```typescript
  if (!security.isOriginTrusted(req.url)) {
    return next(req); // Strip ambient credentials on untrusted origins
  }
  ```
- Anti-CSRF tokens (`X-XSRF-TOKEN`) automatically applied to mutating verbs (`POST`, `PUT`, `DELETE`).

### 2. XSS & CSRF Defenses
- Angular's default text interpolation prevents DOM execution by entity encoding.
- `SafeHtmlPipe` leverages `DomSanitizer.sanitize(SecurityContext.HTML, ...)` for rich safe markup while stripping executable hooks.
- Interactive security playground tests malicious vectors (`<script>`, `onerror`, `javascript:`).

### 3. WCAG 2.1 AA Accessibility
- Every input has an associated `<label for="...">`.
- Inputs expose `[attr.aria-invalid]`, `aria-required="true"`, and `[attr.aria-describedby]` pointing to error elements.
- Dedicated `A11yAnnouncerService` announces form submissions, validation errors, and async network events to screen readers.
- Visible, high-contrast focus rings configured globally via `:focus-visible`.

### 4. Internationalization (i18n)
- Dynamic switching between `en-US`, `es-ES`, and `de-DE`.
- Pure reactive signals update translation strings and pipes (`LocalizedDatePipe`, `LocalizedCurrencyPipe`) instantaneously without page reloads.

### 5. Resilient Real-time SignalR Hub
- Managed connection lifecycle: `Connecting` 🟡 ➜ `Connected` 🟢 ➜ `Reconnecting` 🟠 ➜ `Disconnected` 🔴.
- Exponential backoff retry loop with retry attempts counter and screen-reader status updates.

### 6. Secure File Operations
- PDF Upload: Real-time progress bar with `HttpEventType.UploadProgress` simulation, MIME type validation, file size limit (5MB), and `%PDF-` binary magic-byte inspection.
- Authorized Download: Enforces RBAC permissions before generating and streaming Blobs, extracting filenames, and releasing memory via `URL.revokeObjectURL()`.

### 7. Global HTTP Error Interceptor
- Captures 401 Unauthorized (session logout & redirect), 403 Forbidden (RBAC violation), 404 Not Found, 500 Server Error, and 0 Network Offline.
- Contextual retry triggers with exponential backoff and accessible alerts.

---

## 🚀 Running the Project & Tests

### Start the Development Server
```bash
cd angular-day9
npm start
```
Navigate to `http://localhost:4200` to interact with the portal.

### Run Headless Unit & Integration Tests
```bash
npm run test:ci
```
> **Results**: 38 of 38 tests pass (`TOTAL: 38 SUCCESS, 0 FAILED`).

### Production Build
```bash
npm run build
```
Generates production-optimized chunks with lazy route splitting into `dist/angular-day9/`.
