# Frontend API Mapping

## Scope

This mapping was generated from the complete Spring Boot controller source. The stateless React API layer covers every class annotated with `@RestController`:

1. `AuthApiController`
2. `StudentApiController`
3. `TeacherApiController`
4. `AdminApiController`
5. `AllowedSlokaApiController`
6. `InternalJobController`

The backend mostly uses `Map<String, Object>` rather than declared request/response DTO classes. TypeScript contracts therefore follow the exact keys read and written by each controller. A field is optional when the controller conditionally includes it, and nullable when the controller always includes the key but may supply `null`.

No REST controller accepts multipart requests or `Pageable` parameters. No REST controller uses Jakarta Bean Validation annotations. REST validation is manual inside controller methods.

`TeacherController` contains a session-based `@ResponseBody` endpoint at `POST /teacher/dashboard/update-one-ajax`. It is not a `@RestController`, is outside `/api/v1`, and belongs to the JSP/session security chain. It is intentionally not exposed through the React JWT API services.

## Shared conventions

- Dates from `LocalDate` are ISO `YYYY-MM-DD` strings.
- Date-times are Java ISO date-time strings.
- Successful message-only JSON responses use `ApiMessageResponse`.
- Error JSON responses use `ApiErrorResponse`.
- Internal job endpoints return plain text, modeled as `string`.
- All `/api/v1/admin/**`, `/api/v1/teacher/**`, and `/api/v1/student/**` calls use the JWT supplied by the shared Axios interceptor.

## Controller summary

| Controller | Base URL | Security | Request style | Multipart | Pageable |
|---|---|---|---|---|---|
| `AuthApiController` | `/api/v1/auth` | Public | JSON maps | No | No |
| `StudentApiController` | `/api/v1/student` | `ROLE_STUDENT` | JSON maps and authenticated principal | No | No |
| `TeacherApiController` | `/api/v1/teacher` | `ROLE_TEACHER` | JSON maps, query params, authenticated principal | No | No |
| `AdminApiController` | `/api/v1/admin` | `ROLE_ADMIN` | JSON maps, path variables, query params | No | No |
| `AllowedSlokaApiController` | `/api` | Public under the JSP security chain | Required query params | No | No |
| `InternalJobController` | `/internal/jobs` | Public in current security configuration; intended for Cloud IAM | Empty POST | No | No |

## Endpoint-to-service mapping

### AuthApiController

| Endpoint | Parameters / validation | Request Type | Response Type | Service Method | React Feature |
|---|---|---|---|---|---|
| `POST /api/v1/auth/login` | `volunteerId` and `password` required; volunteer must exist, be ACTIVE, have a password hash, and match BCrypt | `LoginRequest` | `LoginResponse` | `authService.login(request)` | `features/auth` |
| `POST /api/v1/auth/change-password` | All fields required; `newPassword` minimum 6 characters; current password must match | `ChangePasswordRequest` | `ChangePasswordResponse` | `authService.changePassword(request)` | `features/auth` |

### StudentApiController

| Endpoint | Parameters / validation | Request Type | Response Type | Service Method | React Feature |
|---|---|---|---|---|---|
| `GET /api/v1/student/home` | Authenticated principal; student must exist | None | `StudentHomeResponse` | `studentService.getHome()` | `features/student` |
| `GET /api/v1/student/slots` | Authenticated principal; student must exist | None | `StudentSlotsResponse` | `studentService.getSlots()` | `features/student` |
| `POST /api/v1/student/book` | `slotId`, `chapterId`, `slokaCount` required; `date`, second chapter/count optional; student must be slot-eligible | `BookStudentSlotRequest` | `StudentMutationResponse` | `studentService.bookSlot(request)` | `features/student` |
| `POST /api/v1/student/cancel` | `bookingId` required | `CancelStudentBookingRequest` | `StudentMutationResponse` | `studentService.cancelBooking(request)` | `features/student` |
| `GET /api/v1/student/grades` | Authenticated principal | None | `StudentGradesResponse` | `studentService.getGrades()` | `features/student` |
| `GET /api/v1/student/attendance` | Authenticated principal; attendance service requires an existing student | None | `StudentAttendanceResponse` | `studentService.getAttendance()` | `features/student` |

### TeacherApiController

| Endpoint | Parameters / validation | Request Type | Response Type | Service Method | React Feature |
|---|---|---|---|---|---|
| `GET /api/v1/teacher/home` | Authenticated principal; teacher must exist | None | `TeacherHomeResponse` | `teacherService.getHome()` | `features/teacher` |
| `GET /api/v1/teacher/dashboard` | Authenticated principal | None | `TeacherDashboardResponse` | `teacherService.getDashboard()` | `features/teacher` |
| `POST /api/v1/teacher/grade` | `bookingId` required; booking must exist and belong to authenticated teacher; grade/comment fields optional | `UpdateGradeRequest` | `UpdateGradeResponse` | `teacherService.updateGrade(request)` | `features/teacher` |
| `GET /api/v1/teacher/attendance` | Optional query params `groupId`, `weekStart`; week defaults to current Sunday | `TeacherAttendanceQuery` | `TeacherAttendanceResponse` | `teacherService.getAttendance(query)` | `features/teacher` |
| `POST /api/v1/teacher/attendance` | `groupId` required; `weekStart` optional; remaining dynamic keys are converted to service request parameters | `SaveTeacherAttendanceRequest` | `SaveTeacherAttendanceResponse` | `teacherService.saveAttendance(request)` | `features/teacher` |

Backend contract note: there is no REST mapping at `/api/v1/teacher/attendance/save`. The exact save endpoint is `POST /api/v1/teacher/attendance`.

### AdminApiController

| Endpoint | Parameters / validation | Request Type | Response Type | Service Method | React Feature |
|---|---|---|---|---|---|
| `GET /api/v1/admin/volunteers` | Optional queries: `q`, `status`, `enrollmentType`, `trackType`, `groupId` | `VolunteerQuery` | `VolunteerListResponse` | `adminService.getVolunteers(query)` | `features/admin` |
| `POST /api/v1/admin/volunteers/{vid}/edit` | Path `vid`; all body fields optional and applied only when present/valid | `EditVolunteerRequest` | `AdminMessageResponse` | `adminService.editVolunteer(volunteerId, request)` | `features/admin` |
| `POST /api/v1/admin/volunteers/{vid}/drop` | Path `vid`; optional `reason`; volunteer must exist and not already be dropped | `DropVolunteerRequest` | `AdminMessageResponse` | `adminService.dropVolunteer(volunteerId, request)` | `features/admin` |
| `POST /api/v1/admin/volunteers/{vid}/reactivate` | Path `vid`; volunteer must exist and not already be active | None | `AdminMessageResponse` | `adminService.reactivateVolunteer(volunteerId)` | `features/admin` |
| `GET /api/v1/admin/volunteers/{vid}/analytics` | Path `vid`; volunteer must exist | None | `VolunteerAnalyticsResponse` | `adminService.getVolunteerAnalytics(volunteerId)` | `features/admin` |
| `GET /api/v1/admin/enrollments` | No parameters | None | `EnrollmentListResponse` | `adminService.getEnrollments()` | `features/admin` |
| `POST /api/v1/admin/enrollments/{id}/approve` | Numeric path `id`; nonblank `groupId` required | `ApproveEnrollmentRequest` | `AdminMessageResponse` | `adminService.approveEnrollment(id, request)` | `features/admin` |
| `POST /api/v1/admin/enrollments/{id}/reject` | Numeric path `id` | None | `AdminMessageResponse` | `adminService.rejectEnrollment(id)` | `features/admin` |
| `GET /api/v1/admin/syllabus` | Optional query `date`; defaults in controller | `SyllabusQuery` | `SyllabusResponse` | `adminService.getSyllabus(query)` | `features/admin` |
| `POST /api/v1/admin/syllabus/save` | `date` and `entries` required; invalid/blank entry values are skipped | `SaveSyllabusRequest` | `SaveSyllabusResponse` | `adminService.saveSyllabus(request)` | `features/admin` |
| `GET /api/v1/admin/teacher-availability` | Optional query `date`; defaults in controller | `DatedQuery` | `TeacherAvailabilityResponse` | `adminService.getTeacherAvailability(query)` | `features/admin` |
| `POST /api/v1/admin/teacher-availability/save` | `date` and `entries` required; missing slot list is treated as empty | `SaveTeacherAvailabilityRequest` | `AdminMessageResponse` | `adminService.saveTeacherAvailability(request)` | `features/admin` |
| `GET /api/v1/admin/bulk-booking` | Optional query `date`; defaults in controller | `DatedQuery` | `BulkBookingResponse` | `adminService.getBulkBooking(query)` | `features/admin` |
| `POST /api/v1/admin/bulk-booking/save` | Nonempty `entries` required; each processed row requires date, slot, chapter, and sloka count | `SaveBulkBookingRequest` | `SaveBulkBookingResponse` | `adminService.saveBulkBooking(request)` | `features/admin` |
| `POST /api/v1/admin/bulk-booking/delete` | `bookingId` required | `BookingIdRequest` | `AdminMessageResponse` | `adminService.deleteBulkBooking(request)` | `features/admin` |
| `GET /api/v1/admin/teachers-dashboard` | Optional queries `date`, `teacherId` | `TeachersDashboardQuery` | `TeachersDashboardResponse` | `adminService.getTeachersDashboard(query)` | `features/admin` |
| `POST /api/v1/admin/teachers-dashboard/save-one` | `bookingId` required; grades, comment, teacher assignment optional | `SaveDashboardRowRequest` | `AdminMessageResponse` | `adminService.saveDashboardRow(request)` | `features/admin` |
| `POST /api/v1/admin/teachers-dashboard/delete` | `bookingId` required | `BookingIdRequest` | `AdminMessageResponse` | `adminService.deleteDashboardRow(request)` | `features/admin` |
| `GET /api/v1/admin/attendance-config` | No parameters | None | `AttendanceConfigResponse` | `adminService.getAttendanceConfig()` | `features/admin` |
| `GET /api/v1/admin/allowed-slokas` | Required queries `volunteerId`, `date`, `chapterId` | `AllowedSlokasQuery` | `AllowedSlokasResponse` | `adminService.getAllowedSlokas(query)` | `features/admin` |
| `POST /api/v1/admin/attendance-config/save` | `groups` required; blank group IDs are skipped; other group fields are conditionally applied | `SaveAttendanceConfigRequest` | `AdminMessageResponse` | `adminService.saveAttendanceConfig(request)` | `features/admin` |

### AllowedSlokaApiController

| Endpoint | Parameters / validation | Request Type | Response Type | Service Method | React Feature |
|---|---|---|---|---|---|
| `GET /api/allowed-slokas` | Required queries `volunteerId`, ISO `date`, `chapterId` | `AllowedSlokasQuery` | `AllowedSlokasResponse` | `allowedSlokaService.getAllowedSlokas(query)` | `features/chapter` |

### InternalJobController

| Endpoint | Parameters / validation | Request Type | Response Type | Service Method | React Feature |
|---|---|---|---|---|---|
| `POST /internal/jobs/sunday-teacher-reminders` | No request body | None | `JobTriggerResponse` (`string`) | `internalJobService.triggerSundayTeacherReminders()` | `features/system` |
| `POST /internal/jobs/sunday-student-reminders` | No request body | None | `JobTriggerResponse` (`string`) | `internalJobService.triggerSundayStudentReminders()` | `features/system` |
| `POST /internal/jobs/pending-enrollment-reminder` | No request body | None | `JobTriggerResponse` (`string`) | `internalJobService.triggerPendingEnrollmentReminder()` | `features/system` |

## Backend DTO inventory

The backend declares these Java DTO classes:

| Java DTO | Fields | REST controller usage |
|---|---|---|
| `AdminAvailabilityEntry` | `volunteerId`, `date`, `slotIds` | Not used directly by the REST controllers; REST admin availability uses JSON maps |
| `AdminAvailabilityForm` | `entries` | Not used directly by the REST controllers |
| `AdminBulkBookingEntry` | `volunteerId`, `slotId`, `date`, `chapterId1`, `slokaCount1`, optional `chapterId2`, optional `slokaCount2` | Not used directly by the REST controllers; REST bulk booking uses JSON maps with `chapterId`/`slokaCount` names |
| `AdminBulkBookingForm` | `entries` | Not used directly by the REST controllers |
| `EnrollmentForm` | Enrollment registration fields | Used by the JSP MVC enrollment controller, not a REST controller |
| `SlotsDTO` | `id`, `name`, `duration` | Not returned directly by a REST controller |
| `TotalSlotsAvailableDTO` | `id`, `slotId`, `available_Count`, `available` | Not returned directly by a REST controller |
| `VolunteersDTO` | `volunteerId`, `name`, `email`, `groupId`, `enrollmentType` | Not returned directly by a REST controller |

The typed React API layer intentionally follows actual REST JSON rather than unused Java DTO class names.

## Validation and transport findings

- No REST method uses `@Valid`, `@Validated`, or Jakarta constraint annotations.
- No REST method uses multipart/form-data.
- No REST method accepts `Pageable` or returns a Spring `Page`.
- No Java enums are used in REST contracts. Grade, role, status, track, and enrollment categories are backend strings, so the frontend does not narrow them into invented enums.
- `EnrollmentForm` has Bean Validation annotations, but it belongs to JSP MVC registration rather than the REST API:
  - Required name.
  - Volunteer ID pattern `^[A-Za-z]{3}\d{4}$`.
  - WhatsApp phone pattern `^\d{10,15}$`.
  - Optional valid email.
  - Required track and session.
- The teacher attendance response currently serializes `Volunteers` entities from the service. Its TypeScript model reflects all serialized getter fields. This includes `passwordHash`; exposing that field is a backend security concern, but no backend change was made and the frontend service does not add or transform it.

## Generated module locations

```text
src/
├── constants/ApiEndpoints.ts
├── types/api.ts
└── features/
    ├── auth/
    │   ├── index.ts
    │   ├── services/AuthService.ts
    │   └── types/
    ├── student/
    │   ├── index.ts
    │   ├── services/StudentService.ts
    │   └── types/api.ts
    ├── teacher/
    │   ├── index.ts
    │   ├── services/TeacherService.ts
    │   └── types/api.ts
    ├── admin/
    │   ├── index.ts
    │   ├── services/AdminService.ts
    │   └── types/api.ts
    ├── chapter/
    │   ├── index.ts
    │   ├── services/AllowedSlokaService.ts
    │   └── types/api.ts
    └── system/
        ├── index.ts
        ├── services/InternalJobService.ts
        └── types/api.ts
```
