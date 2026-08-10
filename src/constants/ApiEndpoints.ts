export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: "/api/v1/auth/login",
    CHANGE_PASSWORD: "/api/v1/auth/change-password",
  },
  STUDENT: {
    HOME: "/api/v1/student/home",
    ENROLLMENTS: "/api/v1/student/enrollments",
    SLOTS: "/api/v1/student/slots",
    BOOK: "/api/v1/student/book",
    CANCEL: "/api/v1/student/cancel",
    GRADES: "/api/v1/student/grades",
    ATTENDANCE: "/api/v1/student/attendance",
  },
  TEACHER: {
    HOME: "/api/v1/teacher/home",
    MY_AVAILABILITY: "/api/v1/teacher/my-availability",
    DASHBOARD: "/api/v1/teacher/dashboard",
    GRADE: "/api/v1/teacher/grade",
    ATTENDANCE: "/api/v1/teacher/attendance",
  },
  ADMIN: {
    VOLUNTEERS: "/api/v1/admin/volunteers",
    VOLUNTEERS_EXPORT: "/api/v1/admin/volunteers/export",
    VOLUNTEER_EDIT: (volunteerId: string) =>
      `/api/v1/admin/volunteers/${encodeURIComponent(volunteerId)}/edit`,
    VOLUNTEER_DROP: (volunteerId: string) =>
      `/api/v1/admin/volunteers/${encodeURIComponent(volunteerId)}/drop`,
    VOLUNTEER_REACTIVATE: (volunteerId: string) =>
      `/api/v1/admin/volunteers/${encodeURIComponent(volunteerId)}/reactivate`,
    VOLUNTEER_ANALYTICS: (volunteerId: string) =>
      `/api/v1/admin/volunteers/${encodeURIComponent(volunteerId)}/analytics`,
    ENROLLMENTS: "/api/v1/admin/enrollments",
    ENROLLMENT_APPROVE: (id: number) =>
      `/api/v1/admin/enrollments/${id}/approve`,
    ENROLLMENT_REJECT: (id: number) =>
      `/api/v1/admin/enrollments/${id}/reject`,
    ENROLLMENT_COMPLETE: (id: number) =>
      `/api/v1/admin/enrollments/${id}/complete`,
    ENROLLMENT_DROP: (id: number) =>
      `/api/v1/admin/enrollments/${id}/drop`,
    ENROLLMENT_DEFAULT: (id: number) =>
      `/api/v1/admin/enrollments/${id}/default`,
    SYLLABUS: "/api/v1/admin/syllabus",
    SYLLABUS_SAVE: "/api/v1/admin/syllabus/save",
    TEACHER_AVAILABILITY: "/api/v1/admin/teacher-availability",
    TEACHER_AVAILABILITY_SAVE: "/api/v1/admin/teacher-availability/save",
    BULK_BOOKING: "/api/v1/admin/bulk-booking",
    BULK_BOOKING_SAVE: "/api/v1/admin/bulk-booking/save",
    BULK_BOOKING_DELETE: "/api/v1/admin/bulk-booking/delete",
    TEACHERS_DASHBOARD: "/api/v1/admin/teachers-dashboard",
    TEACHERS_DASHBOARD_SAVE_ONE:
      "/api/v1/admin/teachers-dashboard/save-one",
    TEACHERS_DASHBOARD_DELETE: "/api/v1/admin/teachers-dashboard/delete",
    ATTENDANCE_CONFIG: "/api/v1/admin/attendance-config",
    ALLOWED_SLOKAS: "/api/v1/admin/allowed-slokas",
    ATTENDANCE_CONFIG_SAVE: "/api/v1/admin/attendance-config/save",
  },
  CHAPTER: {
    ALLOWED_SLOKAS: "/api/allowed-slokas",
  },
  INTERNAL_JOBS: {
    SUNDAY_TEACHER_REMINDERS:
      "/internal/jobs/sunday-teacher-reminders",
    SUNDAY_STUDENT_REMINDERS:
      "/internal/jobs/sunday-student-reminders",
    PENDING_ENROLLMENT_REMINDER:
      "/internal/jobs/pending-enrollment-reminder",
  },
} as const;
