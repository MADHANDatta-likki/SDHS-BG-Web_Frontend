# React Native to React Web Migration Plan

## 1. Purpose and migration constraints

This document is the implementation roadmap for migrating the existing `SDHS-BG-Frontend` React Native application into `SDHS-BG-Web_Frontend`.

The migration must preserve:

- Existing Spring Boot API contracts and response shapes.
- Existing role-based user flows for `ADMIN`, `TEACHER`, and `STUDENT`.
- Forced password-change behavior for users whose `defaultPassword` flag is true.
- Existing validation, booking, grading, attendance, and administration behavior.
- Existing visual hierarchy and terminology. This is a platform migration, not a redesign.

The Spring Boot backend remains the source of truth. The React Native source is the reference for current client behavior, but locally declared client types should be verified against backend controller responses before each Web feature is implemented.

## 2. Scan scope and inventory

The complete React Native project was scanned, excluding generated dependency and Git directories.

### Application shell

- `App.tsx`: authentication loading gate, forced password-change gate, role-based stack selection, and all registered screens.
- `index.ts`: Expo root registration.
- `app.json`: Expo application, splash, adaptive icon, and favicon configuration.
- `eas.json`: Expo Application Services build configuration.
- `package.json`: React Native, Expo, React Navigation, Axios, secure storage, file-system, and sharing dependencies.
- `src/theme.ts`: shared colors, spacing, radii, font weights, and React Native shadow definitions.

### Screens

There are 21 screen files:

- Authentication: `LoginScreen`, `ChangePasswordScreen`.
- Student: `StudentHomeScreen`, `StudentSlotsScreen`, `StudentGradesScreen`, `StudentAttendanceScreen`.
- Teacher: `TeacherHomeScreen`, `TeacherDashboardScreen`, `TeacherAttendanceScreen`.
- Admin: `AdminHomeScreen`, `AdminSyllabusScreen`, `AdminTeacherAvailabilityScreen`, `AdminBulkBookingScreen`, `AdminTeachersDashboardScreen`, `AdminEnrollmentsScreen`, `AdminVolunteersScreen`, `AdminVolunteerAnalyticsScreen`, `AdminAttendanceConfigScreen`, `AdminReportsScreen`, `AdminGroupDetailScreen`.
- Unregistered utility screen: `PlaceholderScreen`.

Twenty screens are registered in `App.tsx`. `PlaceholderScreen` is not registered or referenced by navigation.

### Shared components

- `TopNavbar`: title and action buttons, including logout styling.
- `WelcomeCard`: greeting, name, and role/group badges.
- `ActionGrid`: responsive collection of action cards.
- `ActionCard`: dashboard navigation action.
- `ContentCard`: titled content panel with optional header badge.
- `StatCard`: compact metric card.
- `AlertBox`: error, success, information, and warning feedback.
- `GradeBadge`: grade-to-color display mapping.
- `Footer`: SDHS program footer.
- `components/index.ts`: shared component exports.

### Context providers

- `AuthProvider` / `AuthContext` is the only context provider.
- It owns `user`, `token`, `isLoading`, `login`, and `logout`.
- It restores persisted session data at startup.
- It normalizes `defaultPassword` from boolean or string values.
- It determines which navigation stack is reachable through state consumed in `App.tsx`.

### Services

- `services/api.ts`
  - Axios instance.
  - Development and production base URLs ending in `/api/v1`.
  - JWT request interceptor.
  - Global 401 storage cleanup.
- `services/storage.ts`
  - Uses Expo SecureStore on native devices.
  - Uses `localStorage` only when running through React Native Web.

### Models

There is no central model directory. Models are declared locally in screens and context:

- Authentication user and context contracts.
- Student slots, chapters, bookings, grades, and attendance records.
- Teacher bookings, grade edits, attendance students, dates, groups, and state maps.
- Admin volunteers, enrollment requests, teachers, slots, chapters, bookings, groups, analytics, syllabus entries, and report rows.

Recommended Web approach: move API request/response contracts into the owning feature's `types/` directory and keep view-only types beside the component that uses them. Avoid one global model directory.

### Utilities

There is no shared utility module. Repeated and local helpers include:

- `nextSunday()` duplicated in `AdminSyllabusScreen`, `AdminTeacherAvailabilityScreen`, `AdminTeachersDashboardScreen`, and `AdminBulkBookingScreen`.
- Sunday/week calculations and ISO/display formatting in `TeacherAttendanceScreen`.
- `fmtDate()` in `AdminGroupDetailScreen`.
- Empty bulk-booking row creation in `AdminBulkBookingScreen`.
- Search and filtering implemented independently in teacher and admin screens.

These should become focused Web utilities or feature hooks only after their current behavior is covered by tests.

### Assets

- `assets/bg_admin.png`: runtime background used by `AdminHomeScreen`.
- `assets/icon.png`: Expo app icon.
- `assets/adaptive-icon.png`: Android adaptive icon.
- `assets/splash-icon.png`: Expo splash image.
- `assets/favicon.png`: Web favicon for the Expo build.

For React Web, `bg_admin.png` is a page asset. The icon and splash files are deployment metadata; reuse them only where appropriate in Vite metadata rather than rendering them as page content.

## 3. Current navigation flow

```text
Application start
└── AuthProvider restores token and user
    ├── Loading
    │   └── Full-page activity indicator
    ├── No user
    │   └── Login
    ├── defaultPassword = true
    │   └── Change Password only
    ├── role = ADMIN
    │   └── Admin Home
    │       ├── Syllabus Config
    │       ├── Teacher Availability
    │       ├── Bulk Student Booking
    │       ├── Teachers Dashboard
    │       ├── New Enrollments
    │       ├── Manage Volunteers
    │       │   └── Volunteer Analytics
    │       ├── Attendance Config
    │       ├── Reports
    │       │   └── Group Detail
    │       └── Change Password
    ├── role = TEACHER
    │   └── Teacher Home
    │       ├── Teacher Dashboard
    │       ├── Teacher Attendance
    │       └── Change Password
    └── Any other authenticated role
        └── Student Home
            ├── Student Slots
            ├── Student Grades
            ├── Student Attendance
            └── Change Password
```

Important migration note: the mobile app treats every authenticated role other than exact `ADMIN` and `TEACHER` as a student. Preserve this behavior initially unless the backend contract is intentionally changed.

### Recommended Web routing model

- Public route: `/login`.
- Forced credential route: `/change-password`.
- Student routes: `/student`, `/student/slots`, `/student/grades`, `/student/attendance`.
- Teacher routes: `/teacher`, `/teacher/dashboard`, `/teacher/attendance`.
- Admin routes: `/admin`, `/admin/syllabus`, `/admin/teacher-availability`, `/admin/bulk-booking`, `/admin/teachers`, `/admin/enrollments`, `/admin/volunteers`, `/admin/volunteers/:volunteerId/analytics`, `/admin/attendance-config`, `/admin/reports`, `/admin/reports/groups/:groupId`.

React Router route guards should reproduce the loading, unauthenticated, forced-password, and role gates. Browser history replaces `navigation.goBack()`, route parameters replace React Navigation params, and direct URL entry must enforce the same role constraints.

## 4. API contract map

The React Native Axios base URL already includes `/api/v1`. Therefore, paths below are shown as the effective Spring Boot paths.

| Feature | Method | Effective endpoint |
|---|---|---|
| Authentication | POST | `/api/v1/auth/login` |
| Authentication | POST | `/api/v1/auth/change-password` |
| Student slots | GET | `/api/v1/student/slots` |
| Student booking | POST | `/api/v1/student/book` |
| Student cancellation | POST | `/api/v1/student/cancel` |
| Student grades | GET | `/api/v1/student/grades` |
| Student attendance | GET | `/api/v1/student/attendance` |
| Teacher dashboard | GET | `/api/v1/teacher/dashboard` |
| Teacher grading | POST | `/api/v1/teacher/grade` |
| Teacher attendance | GET | `/api/v1/teacher/attendance` |
| Teacher attendance | POST | `/api/v1/teacher/attendance/save` |
| Admin syllabus | GET | `/api/v1/admin/syllabus` |
| Admin syllabus | POST | `/api/v1/admin/syllabus/save` |
| Admin availability | GET | `/api/v1/admin/teacher-availability` |
| Admin availability | POST | `/api/v1/admin/teacher-availability/save` |
| Admin bulk booking | GET | `/api/v1/admin/bulk-booking` |
| Admin allowed slokas | GET | `/api/v1/admin/allowed-slokas` |
| Admin bulk booking | POST | `/api/v1/admin/bulk-booking/save` |
| Admin bulk booking | POST | `/api/v1/admin/bulk-booking/delete` |
| Admin teacher dashboard | GET | `/api/v1/admin/teachers-dashboard` |
| Admin teacher dashboard | POST | `/api/v1/admin/teachers-dashboard/save-one` |
| Admin teacher dashboard | POST | `/api/v1/admin/teachers-dashboard/delete` |
| Admin enrollments | GET | `/api/v1/admin/enrollments` |
| Admin enrollment approval | POST | `/api/v1/admin/enrollments/:id/approve` |
| Admin enrollment rejection | POST | `/api/v1/admin/enrollments/:id/reject` |
| Admin volunteers | GET | `/api/v1/admin/volunteers` |
| Admin volunteer edit | POST | `/api/v1/admin/volunteers/:volunteerId/edit` |
| Admin volunteer drop | POST | `/api/v1/admin/volunteers/:volunteerId/drop` |
| Admin volunteer reactivation | POST | `/api/v1/admin/volunteers/:volunteerId/reactivate` |
| Admin volunteer analytics | GET | `/api/v1/admin/volunteers/:volunteerId/analytics` |
| Admin attendance config | GET | `/api/v1/admin/attendance-config` |
| Admin attendance config | POST | `/api/v1/admin/attendance-config/save` |
| Admin reports students | GET | `/api/v1/admin/volunteers?enrollmentType=S` |
| Admin group detail | GET | `/api/v1/admin/volunteers?groupId=:groupId&status=ACTIVE` |

No refresh-token, server logout, or current-user call is used by the React Native application. Do not invent these backend contracts during Web migration.

## 5. Screen-by-screen migration matrix

### Authentication screens

#### LoginScreen

- **Purpose:** Collect volunteer ID and password, submit authentication, display errors/loading, and allow password visibility toggling.
- **API dependencies:** Indirectly calls `POST /api/v1/auth/login` through `AuthContext.login`.
- **Components used:** `AlertBox`, `Footer`; local login card and fields.
- **Shared logic:** Authentication context, server error extraction, required-field validation, default-password flow after login.
- **State management:** Local `volunteerId`, `password`, `showPassword`, `error`, and `loading`; authentication result in `AuthContext`.
- **Recommended React Web location:** `src/features/auth/components/LoginPage.tsx`, with form elements under `src/features/auth/components/` and orchestration in `src/features/auth/hooks/`.
- **Estimated complexity:** **Medium** because session persistence, redirect behavior, validation, and accessible password controls must be preserved.

#### ChangePasswordScreen

- **Purpose:** Change the current user's password, validate confirmation and minimum length, then log out after success.
- **API dependencies:** `POST /api/v1/auth/change-password`.
- **Components used:** `TopNavbar`, `AlertBox`; local password form.
- **Shared logic:** `useAuth` user identity and logout; password validation; delayed logout after successful change.
- **State management:** Local current/new/confirmation password, feedback, and loading state; authentication context for user/logout.
- **Recommended React Web location:** `src/features/auth/components/ChangePasswordPage.tsx`.
- **Estimated complexity:** **Medium** because it participates in the forced-password gate and post-success session transition.

### Student screens

#### StudentHomeScreen

- **Purpose:** Student landing page with identity badges and links to slots, grades, and attendance.
- **API dependencies:** None.
- **Components used:** `TopNavbar`, `WelcomeCard`, `ActionGrid`, `Footer`.
- **Shared logic:** Authenticated user display, logout, change-password navigation, action-card definitions.
- **State management:** Reads `user` and `logout` from `AuthContext`; no local state.
- **Recommended React Web location:** `src/features/student/pages/StudentHomePage.tsx`.
- **Estimated complexity:** **Low**.

#### StudentSlotsScreen

- **Purpose:** Load next-session availability, book one or two chapters/sloka ranges, show existing bookings, and cancel eligible bookings.
- **API dependencies:** `GET /api/v1/student/slots`, `POST /api/v1/student/book`, `POST /api/v1/student/cancel`.
- **Components used:** `TopNavbar`, `AlertBox`, `ContentCard`, `Footer`; local chapter dropdown and booking cards.
- **Shared logic:** Slot eligibility rules, chapter/sloka validation, second-chapter option, booking payload construction, cancellation handling, server feedback.
- **State management:** Extensive local state for server data, selections, dropdowns, booking/cancellation progress, and messages.
- **Recommended React Web location:** `src/features/student/pages/StudentSlotsPage.tsx`, with `SlotPicker`, `ChapterSelect`, `BookingForm`, and `ExistingBookingList` components plus a `useStudentSlots` hook.
- **Estimated complexity:** **High** because it is the largest screen, contains multiple dependent selections, and has several mutation flows.

#### StudentGradesScreen

- **Purpose:** Display exam results with grades, chapter details, teacher attribution, comments, cancellation status, and refresh support.
- **API dependencies:** `GET /api/v1/student/grades`.
- **Components used:** `TopNavbar`, `ContentCard`, `GradeBadge`, `Footer`; local grade result cards.
- **Shared logic:** Loading/error/empty states, grade presentation, refresh behavior.
- **State management:** Local grades, loading, refreshing, and error state.
- **Recommended React Web location:** `src/features/student/pages/StudentGradesPage.tsx`, with reusable `GradeResultCard`.
- **Estimated complexity:** **Low**.

#### StudentAttendanceScreen

- **Purpose:** Show student attendance totals, percentage, present/absent statistics, and attendance history.
- **API dependencies:** `GET /api/v1/student/attendance`.
- **Components used:** `TopNavbar`, `StatCard`, `ContentCard`, `Footer`.
- **Shared logic:** Attendance percentage/stat presentation, loading/error/empty states.
- **State management:** Local attendance response, loading, and error state; auth context for logout.
- **Recommended React Web location:** `src/features/student/pages/StudentAttendancePage.tsx`.
- **Estimated complexity:** **Low**.

### Teacher screens

#### TeacherHomeScreen

- **Purpose:** Teacher landing page with identity badges and links to grading and attendance.
- **API dependencies:** None.
- **Components used:** `TopNavbar`, `WelcomeCard`, `ActionGrid`, `Footer`.
- **Shared logic:** Authenticated user display, logout, change-password navigation, action-card definitions.
- **State management:** Reads user/logout from `AuthContext`; no local state.
- **Recommended React Web location:** `src/features/teacher/pages/TeacherHomePage.tsx`.
- **Estimated complexity:** **Low**.

#### TeacherDashboardScreen

- **Purpose:** Load assigned bookings, search students, edit two grade fields and comments per booking, and save rows independently.
- **API dependencies:** `GET /api/v1/teacher/dashboard`, `POST /api/v1/teacher/grade`.
- **Components used:** `TopNavbar`, `StatCard`, `ContentCard`, `AlertBox`, `Footer`; local booking editor, modal grade picker, search field, and refresh control.
- **Shared logic:** Client-side search, edit-dirty detection, per-row save/loading/feedback maps, grade selection, summary statistics, refresh.
- **State management:** Extensive local normalized state keyed by booking ID plus fetched bookings, grades, filters, modal state, and feedback.
- **Recommended React Web location:** `src/features/teacher/pages/TeacherDashboardPage.tsx`, with `BookingGradeEditor`, `GradeSelect`, `DashboardStats`, and `useTeacherDashboard`.
- **Estimated complexity:** **High** because of editable row state, concurrent row mutations, and multiple UI states.

#### TeacherAttendanceScreen

- **Purpose:** Select a group and week, load students and dates, mark presence/no-class states, navigate weeks, and save attendance.
- **API dependencies:** `GET /api/v1/teacher/attendance`, `POST /api/v1/teacher/attendance/save`.
- **Components used:** `TopNavbar`, `ContentCard`, `AlertBox`, `Footer`; local group selector, week navigator, and horizontally scrolling attendance grid.
- **Shared logic:** Sunday/week calculations, date formatting, available-group selection, composite-key attendance maps, no-class behavior, payload construction.
- **State management:** Local group/week/server data, loading/saving/feedback, presence map, and no-class map; auth context supplies default group.
- **Recommended React Web location:** `src/features/teacher/pages/TeacherAttendancePage.tsx`, with `WeekNavigator`, `GroupSelector`, `AttendanceGrid`, and date utilities.
- **Estimated complexity:** **High** because the two-dimensional grid and coupled attendance/no-class rules require careful responsive and accessible Web behavior.

### Admin screens

#### AdminHomeScreen

- **Purpose:** Admin landing page with navigation to all administration workflows.
- **API dependencies:** None.
- **Components used:** `TopNavbar`, `ActionGrid`, `Footer`, React Native `ImageBackground`.
- **Shared logic:** Logout and action-card route definitions.
- **State management:** Reads authentication context; no local state.
- **Recommended React Web location:** `src/features/admin/pages/AdminHomePage.tsx`.
- **Estimated complexity:** **Low**.

#### AdminSyllabusScreen

- **Purpose:** Configure enabled chapters and allowed slokas for a selected Sunday.
- **API dependencies:** `GET /api/v1/admin/syllabus?date=...`, `POST /api/v1/admin/syllabus/save`.
- **Components used:** `TopNavbar`; local date controls, switch, chapter cards, and feedback banners.
- **Shared logic:** Next-Sunday calculation, chapter enable/disable, allowed-sloka entry, auto-fill/clear actions, payload filtering.
- **State management:** Local date, chapters, loading/saving, error, and success.
- **Recommended React Web location:** `src/features/admin/pages/AdminSyllabusPage.tsx`.
- **Estimated complexity:** **Medium**.

#### AdminTeacherAvailabilityScreen

- **Purpose:** Configure teacher-to-slot availability for a selected Sunday.
- **API dependencies:** `GET /api/v1/admin/teacher-availability?date=...`, `POST /api/v1/admin/teacher-availability/save`.
- **Components used:** `TopNavbar`; local date controls, teacher rows, slot chips, and feedback banners.
- **Shared logic:** Next-Sunday calculation, teacher slot toggling, entry payload construction.
- **State management:** Local date, slots, teacher selections, loading/saving, error, and success.
- **Recommended React Web location:** `src/features/admin/pages/AdminTeacherAvailabilityPage.tsx`.
- **Estimated complexity:** **Medium**.

#### AdminBulkBookingScreen

- **Purpose:** Create multiple student bookings for a date, resolve students by autocomplete, constrain slokas by chapter, display existing bookings, and delete bookings.
- **API dependencies:** `GET /api/v1/admin/bulk-booking`, `GET /api/v1/admin/allowed-slokas`, `POST /api/v1/admin/bulk-booking/save`, `POST /api/v1/admin/bulk-booking/delete`.
- **Components used:** `TopNavbar`; local `StudentAutocomplete`, dynamic booking-entry cards, chip selectors, existing booking cards, alerts.
- **Shared logic:** Next-Sunday calculation, empty-row factory, student search, dependent slot/chapter/sloka selection, allowed-sloka loading, multi-row validation, bulk payload construction, delete confirmation.
- **State management:** Large local collections for reference data, existing bookings, dynamic entry rows, loading/saving, and feedback.
- **Recommended React Web location:** `src/features/admin/pages/AdminBulkBookingPage.tsx`, with reusable `StudentAutocomplete`, `BulkBookingRow`, `OptionChipGroup`, and `ExistingBookingTable`.
- **Estimated complexity:** **High**.

#### AdminTeachersDashboardScreen

- **Purpose:** Filter teacher bookings by date/teacher, edit grades/comments/teacher assignment, save one booking, and delete bookings.
- **API dependencies:** `GET /api/v1/admin/teachers-dashboard`, `POST /api/v1/admin/teachers-dashboard/save-one`, `POST /api/v1/admin/teachers-dashboard/delete`.
- **Components used:** `TopNavbar`; local filter controls, booking cards, edit modal, grade chips, and confirmations.
- **Shared logic:** Next-Sunday calculation, optional teacher filtering, edit-form initialization, mutation handling, deletion confirmation.
- **State management:** Local date/filter/reference data/bookings, selected booking, modal/edit form, loading/saving/error.
- **Recommended React Web location:** `src/features/admin/pages/AdminTeachersDashboardPage.tsx`.
- **Estimated complexity:** **High** because it combines filtering, editing, reassignment, grading, and destructive actions.

#### AdminEnrollmentsScreen

- **Purpose:** Review pending enrollments, approve with a group assignment, or reject.
- **API dependencies:** `GET /api/v1/admin/enrollments`, `POST /api/v1/admin/enrollments/:id/approve`, `POST /api/v1/admin/enrollments/:id/reject`.
- **Components used:** `TopNavbar`; local enrollment cards, approval modal, loading/empty/error states, confirmation alerts.
- **Shared logic:** Selection, group requirement validation, approval/rejection confirmation, refresh after mutation.
- **State management:** Local enrollments, selected enrollment, modal/group value, loading/saving/error.
- **Recommended React Web location:** `src/features/admin/pages/AdminEnrollmentsPage.tsx`.
- **Estimated complexity:** **Medium**.

#### AdminVolunteersScreen

- **Purpose:** Search and filter volunteers, edit volunteer details, drop active volunteers, reactivate dropped volunteers, and open analytics.
- **API dependencies:** `GET /api/v1/admin/volunteers`, `POST /api/v1/admin/volunteers/:volunteerId/edit`, `POST /api/v1/admin/volunteers/:volunteerId/drop`, `POST /api/v1/admin/volunteers/:volunteerId/reactivate`.
- **Components used:** `TopNavbar`; local `MultiSelect`, volunteer cards, edit/drop modals, toggles, and confirmation alerts.
- **Shared logic:** Text search, multi-filter logic, edit-form mapping, status-specific actions, destructive confirmation, analytics navigation.
- **State management:** Extensive local list/filter/modal/selection/form/loading state.
- **Recommended React Web location:** `src/features/admin/pages/AdminVolunteersPage.tsx`, with reusable `VolunteerFilters`, `VolunteerTable`, `EditVolunteerDialog`, and `DropVolunteerDialog`.
- **Estimated complexity:** **High**.

#### AdminVolunteerAnalyticsScreen

- **Purpose:** Display one volunteer's identity, aggregate statistics, and booking/grade history.
- **API dependencies:** `GET /api/v1/admin/volunteers/:volunteerId/analytics`.
- **Components used:** `TopNavbar`; local statistic cards and booking history rows.
- **Shared logic:** Route parameter handling, analytics formatting, loading/error state.
- **State management:** Local analytics response, loading, and error.
- **Recommended React Web location:** `src/features/admin/pages/AdminVolunteerAnalyticsPage.tsx` using URL parameter `:volunteerId`.
- **Estimated complexity:** **Medium**.

#### AdminAttendanceConfigScreen

- **Purpose:** Maintain attendance groups, names, start/end dates, status, and new-group creation.
- **API dependencies:** `GET /api/v1/admin/attendance-config`, `POST /api/v1/admin/attendance-config/save`.
- **Components used:** `TopNavbar`; local group cards, text/date inputs, status chips, add-group form, and feedback banners.
- **Shared logic:** Immutable group updates, filtering valid groups before save, new-group merge.
- **State management:** Local groups, new group, loading/saving, error, and success.
- **Recommended React Web location:** `src/features/admin/pages/AdminAttendanceConfigPage.tsx`.
- **Estimated complexity:** **Medium**.

#### AdminReportsScreen

- **Purpose:** Present teacher/group and student reports, filter students by track, show summary counts, and navigate to group detail.
- **API dependencies:** Concurrent `GET /api/v1/admin/attendance-config` and `GET /api/v1/admin/volunteers?enrollmentType=S`.
- **Components used:** `TopNavbar`, `Footer`; local count cards, group rows, student rows, section headers, filter dropdown, tabs, and modal.
- **Shared logic:** Concurrent loading, tab state, track filtering, group aggregation, scroll positioning, group-detail navigation.
- **State management:** Local active tab, groups, students, filter dropdown, loading/error, and scroll ref.
- **Recommended React Web location:** `src/features/admin/pages/AdminReportsPage.tsx`, with `ReportTabs`, `ReportSummaryCards`, `GroupReportTable`, and `StudentReportTable`.
- **Estimated complexity:** **High** because it contains several internal subviews and responsive report layouts.

#### AdminGroupDetailScreen

- **Purpose:** Show active volunteers in a selected group, split into student/teacher sections, and summarize MEM/Fluent counts.
- **API dependencies:** `GET /api/v1/admin/volunteers?groupId=:groupId&status=ACTIVE`.
- **Components used:** `TopNavbar`, `Footer`; local volunteer rows and type/track badges.
- **Shared logic:** Route params, date formatting, role/type partitioning, summary calculations.
- **State management:** Local volunteers, loading, and error.
- **Recommended React Web location:** `src/features/admin/pages/AdminGroupDetailPage.tsx` using URL parameter `:groupId` and navigation state or fetched data for the optional group name.
- **Estimated complexity:** **Medium**.

### Unregistered screen

#### PlaceholderScreen

- **Purpose:** Generic titled placeholder page.
- **API dependencies:** None.
- **Components used:** `TopNavbar`.
- **Shared logic:** Reads a title from route parameters.
- **State management:** None.
- **Recommended React Web location:** **Do not migrate unless a real route requires it.** Creating generic sample pages would add behavior not present in registered navigation.
- **Estimated complexity:** **Low**.

## 6. Reusable Web component opportunities

### Direct migrations of existing shared components

| React Native component | Recommended Web component | Notes |
|---|---|---|
| `TopNavbar` | `components/layout/AppHeader` | Keep title/action contract; use semantic `header`, `nav`, and `button` elements. |
| `ActionCard` + `ActionGrid` | `components/cards/ActionCard` + `ActionGrid` | Use CSS Grid and router links where actions are navigation. |
| `AlertBox` | `components/common/AlertMessage` | Preserve four variants; add appropriate ARIA live/status semantics. |
| `ContentCard` | `components/cards/ContentCard` | Keep title, variant, optional right label, and children API. |
| `Footer` | `components/layout/AppFooter` | Replace nested native `Text` with semantic inline HTML. |
| `GradeBadge` | `components/common/GradeBadge` | Centralize grade display mapping used by student and teacher flows. |
| `StatCard` | `components/cards/StatCard` | Reuse for student attendance, teacher dashboard, analytics, and reports. |
| `WelcomeCard` | `components/cards/WelcomeCard` | Shared by student and teacher; admin may retain its distinct hero. |

### Duplicates currently embedded in screens

- **Date/session selector:** Syllabus, teacher availability, bulk booking, and teachers dashboard repeat selected-date loading controls.
- **Next-Sunday calculation:** Four exact conceptual duplicates should become one tested date utility.
- **Confirmation dialog:** Enrollment rejection, booking deletion, volunteer reactivation, and similar destructive actions use `Alert.alert`.
- **Edit dialog shell:** Enrollment approval, teacher booking edit, volunteer edit/drop, grade picker, and report filter all repeat modal structure.
- **Loading/error/empty states:** Nearly every API screen implements its own versions.
- **Option chip group:** Slots, chapters, slokas, grades, statuses, and attendance toggles use repeated pressable chip behavior.
- **Search/filter controls:** Teacher booking search, volunteer search, multi-select filters, student autocomplete, and report filters should share accessible primitives.
- **Data list/table shell:** Volunteer, enrollment, booking, report, attendance, and group-detail rows need a responsive table/card pattern.
- **Week navigator:** Teacher attendance should own a reusable date-range navigator rather than mixing calculations into the page.
- **Per-row mutation feedback:** Teacher grading and admin editing need a consistent row status pattern.
- **Role landing page:** Student and teacher homes have nearly identical composition; share a `RoleHomePage` presentation component while keeping role-specific action configuration in each feature.

Do not prematurely merge domain-specific cards solely because they look similar. Share structural primitives while keeping booking, volunteer, grade, and attendance rules in their owning feature.

## 7. React Native-specific replacements

| React Native / Expo API | React Web equivalent or migration guidance |
|---|---|
| `View` | Semantic HTML such as `div`, `section`, `article`, `header`, `nav`, `main`, and `footer`. |
| `Text` | `p`, `span`, headings, labels, table cells, and other semantic text elements. |
| `TouchableOpacity` | Native `button` for actions or React Router `Link`/`NavLink` for navigation. Preserve disabled and focus states. |
| `TextInput` | Controlled HTML `input` or `textarea`; use `type="password"`, `type="date"`, and numeric constraints where contracts allow. |
| `ScrollView` | Normal document flow; use CSS `overflow-x: auto` only for wide chip rows and attendance/report tables. |
| `FlatList` | Array rendering for current data sizes; use a table/list and add virtualization only if measured data volume requires it. |
| `RefreshControl` | Explicit refresh button or data revalidation action. Browser pull-to-refresh should not be treated as application state. |
| `KeyboardAvoidingView` | Responsive CSS and normal browser viewport behavior; ensure focused fields scroll into view. |
| `ActivityIndicator` | Shared CSS spinner or accessible loading status with `aria-live`/`aria-busy`. |
| `Modal` | Accessible dialog component built with the native `<dialog>` element or a portal with focus trapping, Escape handling, and focus restoration. |
| `Alert.alert` | Shared confirmation dialog for decisions; inline alert/toast for non-blocking feedback. Do not use `window.alert` as the final UI. |
| `Switch` | Checkbox with switch semantics (`input type="checkbox"` plus accessible styling). |
| `ImageBackground` | CSS `background-image` on a semantic container using the migrated `bg_admin.png` asset. |
| `StatusBar` | Remove. Browser chrome is not controlled by page components; use document metadata/theme color if needed. |
| `useWindowDimensions` | CSS Grid media queries; use `ResizeObserver` only for behavior that cannot be expressed in CSS. |
| `StyleSheet.create` | Existing project CSS strategy under `assets/styles` or scoped CSS modules if adopted without a UI framework. Convert native shadow/elevation values to CSS `box-shadow`. |
| React Navigation stack | React Router route objects, nested layouts, URL parameters, `Link`, `useNavigate`, and browser history. |
| React Navigation route params | URL path/search parameters for bookmarkable state; navigation state only for optional display metadata. |
| Expo SecureStore | A Web session strategy selected with backend/security owners. `localStorage` matches current React Native Web fallback but increases XSS exposure; do not silently assume it is the final production choice. |
| `Platform` / `__DEV__` | Vite `import.meta.env` variables. Keep the API base URL environment-driven. |
| Expo FileSystem | Browser `Blob`, `URL.createObjectURL`, and download links when report export is migrated. |
| Expo Sharing | Web Share API when available, with download/copy fallback. |
| `require()` image assets | ES module asset imports or Vite public assets. |
| Mobile `numberOfLines` | CSS line clamping or overflow ellipsis. |
| Native `elevation` | CSS `box-shadow`; remove platform-specific shadow fields. |
| `SafeAreaView` | CSS safe-area environment variables only if the Web app is installed as a PWA and actually needs them. It is not currently used in source. |
| `Dimensions` | CSS media/container queries. It is not currently used; `useWindowDimensions` is used by `ActionGrid`. |
| AsyncStorage | Web Storage or the selected session adapter. AsyncStorage is not currently used; Expo SecureStore plus `localStorage` fallback is used. |

### Additional code-quality migration requirements

- Replace all React Navigation `any` route types with typed Web route parameters.
- Replace all `catch (error: any)` usage with `unknown` plus Axios-aware narrowing.
- Move local API response interfaces into feature type modules.
- Keep server state separate from editable form state.
- Preserve response names exactly, including `volunteerId`, `groupId`, `defaultPassword`, grade fields, and booking IDs.
- Avoid encoding query strings manually; use Axios `params` consistently.
- Add abort/cancellation behavior for requests when route changes can invalidate results.

## 8. Recommended Web feature structure

```text
src/
├── api/
│   └── axios.ts
├── components/
│   ├── common/
│   ├── layout/
│   ├── forms/
│   ├── cards/
│   ├── dialogs/
│   └── tables/
├── features/
│   ├── auth/
│   ├── student/
│   ├── teacher/
│   └── admin/
├── layouts/
├── routes/
├── constants/
├── theme/
├── types/
└── utils/
```

Each feature should own its pages, feature-only components, hooks, services, and types. Only promote a component to `src/components/` after at least two features use the same behavior and accessibility contract.

## 9. Recommended migration order

The order below minimizes rework and establishes dependencies before complex screens.

### Phase 0: Contract and test baseline

1. Record backend request/response examples from controllers or integration tests.
2. Define typed route maps and endpoint constants.
3. Establish shared loading, error, empty, dialog, field, card, and table primitives.
4. Port theme tokens and the admin background asset without redesigning them.
5. Define acceptance checks comparing React Native and Web behavior.

### Phase 1: Authentication and application shell

1. Axios base URL and error normalization.
2. Session storage strategy and authentication context.
3. Login.
4. Forced change-password flow.
5. Protected and role-restricted routes.
6. Authenticated/public layouts, header, footer, and logout.

This phase is required before any role feature can be verified end to end.

### Phase 2: Role landing pages and shared navigation

1. Shared action cards/grid and welcome/stat/content cards.
2. Student Home.
3. Teacher Home.
4. Admin Home.

These low-complexity screens validate route access, user identity, shared layouts, responsive behavior, and assets.

### Phase 3: Read-only role features

1. Student Grades.
2. Student Attendance.
3. Admin Volunteer Analytics.
4. Admin Group Detail.
5. Admin Reports read-only tabs and filters.

This phase validates typed data fetching, error/empty/loading states, responsive lists/tables, route parameters, and grade/stat components before mutation-heavy screens.

### Phase 4: Student mutations

1. Student Slots data display.
2. Single-chapter booking.
3. Second-chapter booking.
4. Existing booking cancellation.

Migrate this as incremental vertical slices because validation and dependent controls are tightly coupled.

### Phase 5: Teacher workflows

1. Teacher Dashboard read-only booking list/search.
2. Grade/comment editing and per-row save.
3. Teacher Attendance group/week loading.
4. Attendance/no-class editing and save.

Teacher grading should precede attendance because it establishes reusable editable-row and mutation-feedback patterns.

### Phase 6: Admin configuration workflows

1. Attendance Config.
2. Syllabus Config.
3. Teacher Availability.
4. New Enrollments.

These establish reusable date selectors, option chips, form dialogs, validation, and confirmation flows.

### Phase 7: Complex admin workflows

1. Manage Volunteers and Volunteer Analytics navigation.
2. Teachers Dashboard.
3. Bulk Student Booking.
4. Final Admin Reports and Group Detail integration.

Bulk booking is last because it depends on nearly every shared primitive: autocomplete, dynamic rows, dependent selections, validation, confirmations, tables/cards, and mutation feedback.

### Phase 8: Hardening and deployment

1. Keyboard-only and screen-reader verification.
2. Responsive checks at phone, tablet, laptop, and wide-table sizes.
3. Direct URL and browser back/forward testing.
4. Role and forced-password route security checks.
5. API error, expired token, slow response, and duplicate-submission checks.
6. Cross-check every mutation payload against Spring Boot.
7. Configure Render SPA history fallback and environment variables.
8. Run production build and end-to-end smoke tests.

## 10. Complexity summary

| Complexity | Screens |
|---|---|
| Low | Student Home, Student Grades, Student Attendance, Teacher Home, Admin Home, Placeholder |
| Medium | Login, Change Password, Admin Syllabus, Admin Teacher Availability, Admin Enrollments, Admin Volunteer Analytics, Admin Attendance Config, Admin Group Detail |
| High | Student Slots, Teacher Dashboard, Teacher Attendance, Admin Bulk Booking, Admin Teachers Dashboard, Admin Volunteers, Admin Reports |

## 11. Migration risks and verification checkpoints

- **Session security:** Native SecureStore has no direct browser equivalent. Agree on the Web token-storage threat model before authentication implementation.
- **Endpoint prefix:** The mobile Axios instance includes `/api/v1` in its base URL. The Web client must avoid either omitting or duplicating that prefix.
- **401 behavior:** Mobile storage cleanup does not itself update `AuthContext` immediately. The Web design should keep session state and interceptor behavior synchronized without changing user-facing semantics.
- **Forced password flow:** This is a global navigation gate, not merely a link. It must block all role routes until successful change and logout.
- **Role fallback:** Unknown authenticated roles currently enter the student stack. Preserve initially and document any later security decision.
- **Date behavior:** Date helpers use local JavaScript dates. Verify timezone behavior around Saturday/Sunday boundaries and deployment timezone.
- **Large editable screens:** Keep original server data separate from drafts to prevent accidental mutation and incorrect dirty checks.
- **Confirmations:** Destructive actions must retain explicit confirmation and disable duplicate submissions.
- **Responsive tables:** Attendance grids and reports need horizontal overflow without hiding row labels or actions.
- **Accessibility:** Every custom chip, dropdown, modal, toggle, and autocomplete requires keyboard and screen-reader behavior absent from native touch components.
- **No redesign:** Visual improvements should be limited to platform-appropriate semantics, responsiveness, focus behavior, and accessibility.

## 12. Definition of done for each migrated screen

A screen is migrated only when:

1. Its route and role access match the React Native flow.
2. Its API method, path, query parameters, request body, and response mapping match the backend.
3. Loading, success, empty, validation, and failure states match current behavior.
4. Navigation, logout, and forced-password interactions remain correct.
5. It is usable with keyboard, pointer, and common screen readers.
6. It is responsive without losing data or actions.
7. Strict TypeScript passes without `any`.
8. Relevant unit/component tests and an end-to-end happy path pass.
9. No fake data, duplicate business logic, or unverified backend contract has been introduced.
