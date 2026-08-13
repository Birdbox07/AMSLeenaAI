# Attendance Management System — Project Notes

## Structure (feature-module architecture)
- Entry: `src/main.jsx` (wraps `<App/>` in `QueryClientProvider` + `ErrorBoundary`) → `src/app/App.jsx` (root shell: sidebar/topnav/bottom-nav/module routing, dark mode toggle). This is the LIVE app.
- Each module lives in its own folder under `src/features/<name>/`, typically:
  - `<Name>Page.jsx` — the UI component
  - `<name>.mock.js` — seed/generated mock data (also holds `CURRENT_USER`, `MY_REPORTEES`, `getLeaveBalance`, `getReportingChain` where relevant)
  - `<name>.service.js` — async CRUD layer, already shaped like a future real API call (`async function getX() { await delay(); return MOCK_DATA; }`) — this is the ONE place per feature that will need to change when a real backend exists
  - `hooks/use<Feature>Query.js` — **the data layer** (see TanStack Query section below) — replaces the old per-feature zustand `<name>.store.js` files, which have all been deleted
  - `<name>.validators.js` — form validation (present for every feature with a form — see Validation section)
  - `hooks/` — other feature-specific hooks (e.g. `features/employees/hooks/useEmployees.js` exports `useCurrentUser()`, `useMyReportees()`, `getReportingChain`)
  - `<name>.css` — **currently EMPTY on purpose** (see Styling below) — a few features (`attendance`, `leave`, `location`, `tax-declaration`) have a `@reference "../../styles/tailwind.css";` header comment + a handful of real `@apply` rules for genuinely repeated Tailwind combos; most stay fully empty
- Shared UI: `src/shared/components/` (`Btn`, `Modal`+`FormField`+`inputCls`, `DataTable`, `StatusBadge`, `CountUp`), `src/shared/mock/constants.js` (`DEPTS`, `LOCS`, etc.), `src/shared/utils/` (`cn`, `downloadTextFile`, `globalSearch.store.js`).
- Layout: `src/app/layout/Sidebar.jsx` (desktop, supports collapsible dropdown groups), `src/app/layout/TopNav.jsx` (breadcrumb + working global search), `src/app/layout/BottomNav.jsx` (**mobile-only**, `md:hidden`, fixed bottom tab bar: Home/Attendance/Leave/Documents + "More" opens the Sidebar drawer — native-app style), nav list in `src/app/nav.js`.
- No auth — `CURRENT_USER` (from employees mock) is the hardcoded "logged in" person. `MY_REPORTEES` = employees whose `manager` field equals `CURRENT_USER.name`. Role-based access is *simulated* on top of this single identity — see RBAC section.

### Dead code (removed)
The app was fully converted to plain JS/JSX. The old single-file `src/app/App.tsx`, the unused `src/app/components/ui/**` shadcn/ui scaffold (~47 files), the `figma/ImageWithFallback.jsx` helper, and several orphaned wrapper hooks/`globals.css` left over from refactors have all been confirmed unreferenced and deleted. Nothing in `src/app/` should exist outside `App.jsx`, `layout/`, and `nav.js`.

## Data layer — TanStack Query + zustand hybrid (current architecture)
- **TanStack Query owns server-state** (the entity lists), **zustand/local `useState` owns UI-only state** (filters, tabs, selected role, search text). Every feature's old `<name>.store.js` (zustand `createEntityStore`) has been deleted and replaced by `hooks/use<Feature>Query.js`, following the reference pattern in `src/features/employees/hooks/useEmployeesQuery.js`:
  - `use<Feature>Query()` — `useQuery({ queryKey, queryFn: get<Feature>, initialData: MOCK_ARRAY })` (initialData avoids a loading flash since this is still mock data).
  - `use<Feature>Mutations()` — one `useMutation` per CRUD op, each using `queryClient.setQueryData` for an **optimistic update**, an `onError` rollback (restores the pre-mutation cache snapshot), and `onSettled: () => queryClient.invalidateQueries(...)`.
- `src/shared/api/queryClient.js` is the ONE shared `QueryClient` (imported by `main.jsx` for the `QueryClientProvider`, and directly by a couple of cross-feature mutations that need to touch another feature's cache — e.g. `leave.wfh` approving flips matching `attendance` records to `"WFH"` via `patchAttendanceRecord(queryClient, id, patch)` from `attendance/hooks/useAttendanceQuery.js`).
- `src/shared/api/api.js` — a real axios instance (baseURL from `VITE_API_BASE_URL` or `/api`, request interceptor for a future auth token, response interceptor routing every HTTP error through the central error handler). **Not yet called by anything** — it's ready scaffolding for when a real backend exists; each feature's `.service.js` function body is the one-line change point (swap the mock-resolve body for `return api.get('/x').then(r => r.data)`).
- Global error handling (3 layers, all funnel into `src/shared/errors/errorHandler.js`'s `handleError()` — toast + console.error, so **no component should need its own try/catch for a data operation**):
  1. `api.js`'s axios response interceptor (HTTP/network errors).
  2. `queryClient.js`'s global `QueryCache`/`MutationCache` `onError`.
  3. `src/shared/errors/ErrorBoundary.jsx` wraps `<App/>` in `main.jsx` for render-time errors.
- Cross-cutting consumer files that read from MANY features' query hooks — always update these centrally, don't let a per-feature migration touch them piecemeal: `src/app/layout/TopNav.jsx` (global search reads employees/tickets/documents), `src/features/dashboard/DashboardPage.jsx` (reads leave/tickets/attendance), `src/features/reports/ReportsPage.jsx` (reads nearly every feature's query for its report tabs).

## Role-based access (RBAC) — simulated, since there's no login
- `src/features/employees/employees.roles.js` — `getEmployeeRole(emp)` derives **Employee / Manager / HR Admin** from department+designation+whether they have reportees (mirrors the legacy system's approver-hierarchy + hardcoded-admin-allowlist patterns, cleaned up into 3 real roles). `roleAtLeast(role, minRole)` for hierarchy checks.
- `src/shared/access/role.store.js` — a small zustand store (`useSimulatedRole()`, `useHasRole(minRole)`, `useRoleActions().setSimulatedRole`) holding the **currently simulated** role, defaulting to `getEmployeeRole(CURRENT_USER)`. `CURRENT_USER`'s natural role computes to **Manager** (Finance dept, Tech Lead, has reportees) — not HR Admin — so admin-only actions are hidden by default until switched.
- A **"View As"** role switcher lives in Settings (`SettingsPage.jsx`) — since there's no login, this simulates a permission level for demo purposes without changing `CURRENT_USER`'s identity.
- Gating pattern used everywhere: `useHasRole("HR Admin")` gates admin-only buttons (Bulk Upload Documents, Bulk Import Employees, Add/Edit/Delete Employee, Policies Add/Edit); `useHasRole("Manager")` gates the `isManager` flag used for every manager/reportee scope toggle (Attendance, Leave + its 4 sub-tabs, Location) — **`isManager` must always be `MY_REPORTEES.length > 0 && useHasRole("Manager")`, never reportees-only**, or a role downgrade won't actually hide manager views (this was a real bug, since fixed everywhere). The `Reports` nav item itself has `minRole: "Manager"` in `nav.js`.
- **Important scoping-state gotcha**: any manager/reportee scope toggle (`team`/`mine`) must make its underlying data filter re-check `isManager` too, not just the toggle's own `scope` state — otherwise downgrading role after "team" was already selected leaves stale reportee data visible even though the toggle UI disappears (real bug found and fixed in `AttendancePage.jsx`; the same pattern is now correct in `LeavePage.jsx` and all 4 Leave sub-tabs).

## Validation
Every feature with a form has a `<name>.validators.js` exporting `validate<X>Form(form)` → errors object, called before the mutation fires, with `toast.error(Object.values(errors)[0])` on failure. This has been audited across the whole app — if you add a new form, follow this exact pattern (see `src/features/leave/leave.onduty.validators.js` as a clean reference). Don't duplicate validation logic inline in a component when a validators file already exists for that feature.

## Styling — Tailwind, and why the `.css` files are (mostly) empty
- Styling is Tailwind CSS v4 (`@tailwindcss/vite`), utility classes written directly in JSX `className` props.
- Every feature has a sibling `.css` file that's imported. Most are **intentionally empty** — don't add rules to them. A few (`attendance.css`, `leave.css`, `location.css`, `tax-declaration/taxdeclaration.css`) legitimately use `@reference "../../styles/tailwind.css";` + `@apply` for a handful of genuinely repeated Tailwind combos — this is the one exception to "don't write custom CSS," confirmed working (Tailwind v4's `@apply` needs that `@reference` line to resolve utilities inside a non-entry CSS file). Don't reintroduce broad hand-written CSS beyond this narrow pattern.
- `vite.config.js` has an explicit comment: *"The React and Tailwind plugins are both required for Make, even if Tailwind is not being actively used – do not remove them."* Don't remove `@tailwindcss/vite`, `tailwindcss`, or `tw-animate-css` from `vite.config.js`/`package.json`.
- Design tokens are real CSS custom properties in `src/styles/theme.css` (`:root` + `.dark`), exposed to Tailwind via a `@theme inline` block. Dark mode is a `.dark` class toggled high in the tree, not `prefers-color-scheme`.
- `src/styles/animations.css` defines global, non-Tailwind keyframe/utility classes: `animate-fade-in-up`, `animate-pop-in`, `animate-pulse-dot`, `hover-lift`, `card-shimmer`. Used fairly broadly now (page-entrance stagger, hover-lift on clickable cards, modal pop-in, sparing pulse-dot on ~2 live indicators) — respects `prefers-reduced-motion`. Don't add new keyframes; reuse these.
- Font: **IBM Plex Sans**. Brand color: brick red/dusty rose (`--primary:#9A2F33` light / `#E0797D` dark). Sidebar stays dark in both themes.

## Modal component
- `Modal` (`src/shared/components/Modal.jsx`) takes a `maxWidth` prop with a **literal Tailwind class string**, e.g. `maxWidth="max-w-lg"` (default `"max-w-md"`). Follow this pattern for any new modal. Some newer multi-step flows (Income Tax Declaration) render inline on the page instead of in a Modal — see that feature's notes below for when inline-vs-modal is the right call.

## CRUD / state pattern
- Pattern for a CRUD button: local `useState` for form fields → validate via the feature's validators file → `<Modal>` (`FormField` + `inputCls`) → on submit, call the query hook's mutation → `toast.success(...)` (errors are handled centrally, see Data layer section) → close modal. **Every action button must do something real** — never `toast.success(...)` alone.
- `downloadTextFile(fileName, content)` triggers a real Blob download — used for Documents "Download".
- `ATTENDANCE` has no CRUD UI (read-only) — the one exception is the WFH-approval-syncs-attendance side effect (see Data layer).

## Key modules (behavioral notes)
- **Dashboard** — personal/self-scoped only. No charts (explicitly removed per user request); animations (fade-in-up stagger, hover-lift, CountUp) are welcome.
- **Attendance** (`Attendance & Regularization` in nav, grouped with Location Tracker under an "Attendance" dropdown) — Attendance Log tab (My Reportees/Mine scope toggle for managers, no Department filter/column) + **Regularization** tab (missed-swipe correction requests, Pending→Approved/Rejected/Cancelled) + **Shift Change** tab (request a new shift). Both sub-tabs reuse the exact manager-scoping toggle pattern.
- **Location Tracker** — new module (grouped under "Attendance" dropdown): GPS check-in (real geolocation API with a mocked-office-coordinate fallback), a manager Approval Queue for reportees' pending check-ins, and a self-scoped date-range History view.
- **Leave Management** — 4 tabs: **Leave Requests** (original), **Comp-Off Ledger** (Credit/Debit entries + running balance, "Avail" requires approval), **On-Duty Requests**, **Work From Home** (approving syncs matching attendance records to `"WFH"` status). All 4 share the same manager/reportee scope-toggle pattern and manager-role gating.
- **Documents** — two tabs: **Documents** (per-employee document-type access gating via `documents.access` — most employees see all 8 doc types, ~10% have specific types restricted; Bulk Upload lives only in Employee Directory now, no duplicate single-upload here) + **Income Tax Declaration** (ported from the legacy system's actual 5-step wizard UI — Personal Details → Tax Regime → NPS Details → Tax Deductions → Review & Submit — rendered inline on the page, not in a Modal, with a live-updating summary; this is the one feature where replicating the legacy UI structure was explicitly requested, done in Tailwind not the legacy's own CSS).
- **Employee Directory** — Add/Edit/Delete + Bulk Upload Documents + Bulk Import Employees (all gated to `HR Admin` role) + a **Family Details & Mediclaim** modal per employee (a single consolidated data model — the legacy system had two overlapping tables for family info and Mediclaim-insured-dependents; here it's one record with per-dependent `insured` flags, not two separate features).
- **Services** — a thin composition module (no data layer of its own) consolidating 5 previously-separate top-level nav items into tabs: Learning Portal, Conference Room, Organization, Holiday Calendar, Policies. Each sub-page's internals are unchanged; only routing/nav is consolidated.
- **Reports** — many tabs (Attendance/Leave/Employee/Service Desk/Regularization/Shift Change/Comp-Off/On-Duty/WFH/Location), all reading live query hooks. No Department columns anywhere. Adding a new feature with reportable data → add a tab here too, following the existing pattern exactly.
- **Settings** — Profile/Appearance/Notifications (original) + **View As** role switcher + **Uniform Size Declaration** (gender-gated via a self-contained pseudo-flag since `Employee` has no real gender field — see `uniform.mock.js` for the note on promoting this to a shared field later) + **Employee Feedback** (location-scoped recipient list, append-only).
- **TopNav** — "My Profile" modal, breadcrumb via `findNavLabel()` (handles both flat and grouped nav items), and a **working global search** (employees/tickets/documents, grouped dropdown results, clicking a result navigates + pre-filters that page's `DataTable` via `globalSearch.store.js`'s pending-query mechanism).
- Shared `DataTable` toolbar: Search/CSV/Print only (no copy-to-clipboard). Supports an optional `initialSearch` prop for the global-search prefill.

## Navigation structure
`src/app/nav.js` supports **grouped/collapsible dropdown nav items** (an item with `children: [...]` renders as an expandable group in `Sidebar.jsx`) to keep the sidebar from growing one row per feature — currently two groups: "Attendance" (Attendance + Location Tracker) and none other after Services consolidation absorbed 5 items into one. `FLAT_NAV_ITEMS`, `findNavLabel()`, `findParentGroupId()` are exported for flat lookups (breadcrumb, active-group-highlighting). An item can carry `minRole` for role-gating (see RBAC section) — `Sidebar.jsx` filters on this and falls back to Dashboard if the active module becomes hidden after a role downgrade.

## Preferences (feedback memory candidates)
- Department filters/columns are unwanted anywhere in the app.
- Dashboard must stay personal/self-scoped — no org-wide tables/charts.
- Manager/reportee scoping is a running theme — always gate the underlying `isManager` flag on BOTH reportee-count AND role (`useHasRole("Manager")`), and always make scope-toggle-filtered data re-check `isManager`, not just the toggle state (see RBAC gotcha above).
- **Every action button must do something real** — never `toast.success(...)` alone; wire it to a real mutation.
- Large single-line/minified reference files should be mined with grep/agents, never `Read` directly.
- Don't convert Tailwind to plain CSS (tried once, explicitly reverted) — the narrow `@reference`+`@apply` exception above is the one allowed departure from pure inline utilities.
- When porting legacy-system logic: replicate the *business rules*, not the legacy UI — the one explicit exception so far is Income Tax Declaration's step-wizard structure, requested by name.
- This project has been extended heavily by parallel background agents in past sessions — when doing another large multi-file rollout, group work by feature folder, explicitly exclude cross-cutting consumer files (TopNav/DashboardPage/ReportsPage/EmployeesPage) from parallel agents' scope, and do those centrally yourself afterward to avoid edit conflicts.

## Build
```
npm install
npx vite build   # or: npm run build
npm run dev      # local dev server (kill port 5173 first if reusing: lsof -ti:5173 -sTCP:LISTEN | xargs -r kill)
```

## Key dependencies added this project (beyond the original scaffold)
`zustand` (local/UI state), `@tanstack/react-query` + `axios` (server-state + future real API layer).
