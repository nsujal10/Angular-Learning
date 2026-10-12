# SpikeHR • Employee Management Portal v4 (Day 4 Hands-On Project)

A full-stack, enterprise-grade Angular 17 Dark Dashboard upgraded to use a **real REST API backend** with JWT session rotation, role-based authorization, interceptors, and failure recovery.

Reference UI: [Dribbble Dark Theme Employee Dashboard](https://dribbble.com/shots/25079136-Employee-Management-Dashboard-Design-Dark-Theme)

---

## ⚡ Quick Start

### 1. Launch the Backend Server (Port 3000)
Open a terminal in `angular-day4`:
```powershell
cd "d:\Projects\Angular Learning\angular-day4"
npm run server
```
Server outputs:
```
[SpikeHR Backend API] Running on http://localhost:3000
```

### 2. Launch the Angular Frontend (Port 4200)
In a second terminal:
```powershell
cd "d:\Projects\Angular Learning\angular-day4"
npm start
```
Open `http://localhost:4200/` in your browser. (The dev server automatically proxies `/api/*` to `http://localhost:3000` via `proxy.conf.json`).

---

## 🔐 Demo Credentials

| Role | Email | Password | Permissions |
| :--- | :--- | :--- | :--- |
| **👑 Admin** | `admin@spikeoffice.io` | `Admin@123` | Full access: View, Add, Edit, Delete, Admin Settings |
| **💼 Manager** | `manager@spikeoffice.io` | `Manager@123` | View, Add, Edit, Manager Fields (Deletion & Admin Settings blocked) |
| **👤 Employee** | `employee@spikeoffice.io` | `Employee@123` | Read-only Directory (Add, Edit, Delete blocked) |

*(Quick 1-click login buttons are provided on the Login page).*

---

## 🏗️ 5-Step Implementation Checklist

### Step 1 — Implement CRUD & Real Backend
- [x] `GET /api/employees`: Paginated, filtered, and sorted employee directory list.
- [x] `GET /api/employees/:id`: Individual employee detail.
- [x] `POST /api/employees`: Validates required fields, checks duplicates, returns `201 Created`.
- [x] `PATCH /api/employees/:id`: Incremental update with ID immutability.
- [x] `DELETE /api/employees/:id`: Backend role check: returns `403 Forbidden` if requester is not an Admin!
- [x] `POST /api/auth/login`: Issues 15-minute access token and 7-day refresh token.
- [x] `POST /api/auth/refresh`: Rotates access and refresh tokens.
- [x] `POST /api/auth/logout`: Invalidates session on the backend.

### Step 2 — Proper User Experience
- [x] **Loading Indicators**: Top global in-flight progress bar + animated table skeleton shimmers.
- [x] **Empty State**: Custom empty view when search/filter returns zero records.
- [x] **Error Handling**: Non-blocking alert cards with one-click "Retry" actions.
- [x] **Success/Error Feedback**: Real-time floating toast notifications.
- [x] **Debounced Search & Filtering**: 350ms debounce synced two-way with URL query parameters.
- [x] **Pagination & Sorting**: Backend pagination and clickable sort headers.
- [x] **Confirmation Modal**: Custom modal dialog before issuing `DELETE` requests.

### Step 3 — Authentication & Interceptors
- [x] **Connected Login**: Connected directly to `POST /api/auth/login`.
- [x] **State Management**: Reactive `currentUser$`, role checks, and token persistence in `localStorage`.
- [x] **HTTP Interceptor (`auth.interceptor.ts`)**:
  - Automatically attaches `Authorization: Bearer <accessToken>`.
  - Intercepts `401 Unauthorized`: Triggers automatic silent renewal via `POST /api/auth/refresh` and retries the original request.
  - If refresh fails, clears session and redirects to `/login`.
  - Intercepts `403 Forbidden`: Displays warning toast and redirects to `/forbidden`.
  - Intercepts `status: 0`: Catches offline server connection errors.
  - Tracks loading state via `LoadingService`.

### Step 4 — Authorization & Role-Based Access Control
- [x] **Admin-Only Deletion**: UI and Backend 403 guard preventing Manager/Employee deletion.
- [x] **Restricted Route**: `/admin-settings` protected by functional `adminGuard`.
- [x] **Forbidden Page**: `/forbidden` explains missing privileges with active session metadata.
- [x] **Manager Fields**: Conditional team size and bonus fields for leadership roles.

### Step 5 — Test Failure Scenarios (Interactive Console on Dashboard)
1. **Backend Offline**: Toggle simulated network disconnect to trigger `status: 0`.
2. **Incorrect Credentials**: One-click test button on Login page triggers `401 Invalid credentials`.
3. **Expired Access Token**: "Expire Access Token" button triggers silent renewal on next API call.
4. **Delete Without Admin**: Attempting delete as Manager/Employee triggers real backend `403 Forbidden`.
5. **Non-Existent Employee**: Requests ID `99999` to trigger `404 Not Found`.
6. **Submit Invalid Form**: Form blocks submission on client; backend validates on server.
7. **Server 500 Error**: "Trigger Server 500" button simulates an unexpected crash.
8. **Failed Refresh Token**: Corrupts refresh token to trigger complete session logout.
