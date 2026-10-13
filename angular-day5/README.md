# SpikeHR • Live Employee Search (Day 5 Hands-On Project)

A production-grade Angular 17 live employee search implementation demonstrating the core **RxJS search pipeline pattern**:
`searchControl.valueChanges` &rarr; `debounceTime` &rarr; `distinctUntilChanged` &rarr; `switchMap` &rarr; `takeUntilDestroyed`.

---

## ⚡ Quick Start

### 1. Start the Backend API (Port 3000)
In terminal 1:
```powershell
cd "d:\Projects\Angular Learning\angular-day5"
npm run server
```
Server log will display:
```
[Live Search API] Server listening on http://localhost:3000
  Endpoint available: GET /api/employees?search=term
```

### 2. Start the Angular Dev Server (Port 4200)
In terminal 2:
```powershell
cd "d:\Projects\Angular Learning\angular-day5"
npm start
```
Open `http://localhost:4200/` in your browser. (The dev server proxies `/api` to `http://localhost:3000` via `proxy.conf.json`).

---

## 🔍 The RxJS Request Pipeline Explained (Step by Step)

```
User types "ang"
  │
  ▼
[FormControl.valueChanges]  ── Emits every single raw keystroke ('a', 'an', 'ang')
  │
  ▼
[debounceTime(300)]         ── Waits for a 300ms pause in typing before emitting.
  │                            Discards bursts of fast typing to prevent server overload.
  ▼
[distinctUntilChanged()]    ── Compares current term with previous term.
  │                            Skips execution if identical (e.g. arrow keys, blur).
  ▼
[switchMap(term => api)]    ── CRITICAL: Subscribes to the new search request AND
  │                            AUTOMATICALLY CANCELS any prior in-flight HTTP request!
  ▼
[catchError()]              ── Catches errors inside the inner observable so the
  │                            outer stream never dies on server failure.
  ▼
[takeUntilDestroyed()]      ── Unsubscribes cleanly when the component is destroyed.
```

---

## 💡 Production Improvement (Step 4: State-Driven Modeling)

### Problem with a Shared `loading` Boolean:
In simple implementations, using a mutable `loading = true` flag with `finalize(() => loading = false)` can cause subtle race conditions: when an older request is superseded and cancelled by `switchMap`, its `finalize()` might briefly run while a new request is still pending, causing the spinner to flicker or disappear prematurely.

### Solution (State-Driven Stream):
In [`employee-search.component.ts`](file:///d:/Projects/Angular%20Learning/angular-day5/src/app/features/employee-search/employee-search.component.ts), each search request is modeled as a unified state emitted from inside `switchMap`:
```typescript
export interface SearchState {
  status: 'idle' | 'loading' | 'success' | 'error';
  employees: Employee[];
  errorMessage?: string;
  searchTerm?: string;
}
```
This guarantees that the loading indicator and result list are always strictly synchronized with the current active request.

---

## 🧪 Testing Live Search & Cancellation

1. **Test Debouncing**: Open Developer Tools (`F12`) &rarr; **Network Tab**. Type fast: `Engineering`. Notice only **one** network request is sent after you finish typing, instead of 11 separate requests!
2. **Test `switchMap` Cancellation**: Type `Eng`, wait 300ms, then immediately type `ineering`. In the Network tab, observe the first request marked as `(canceled)` in red, and the second request returned.
3. **Test Error Handling**: Click the **"Simulate API Failure"** button and type a search term. The component catches the 500 error gracefully and renders the `@if (errorMessage)` alert without crashing the search stream.
