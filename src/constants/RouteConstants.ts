export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  DASHBOARD: "/dashboard",
  STUDENT: {
    SLOTS: "/student/slots",
    GRADES: "/student/grades",
    ATTENDANCE: "/student/attendance",
  },
  TEACHER: {
    DASHBOARD: "/teacher/dashboard",
    ATTENDANCE: "/teacher/attendance",
  },
  ADMIN: {
    SYLLABUS: "/admin/syllabus",
    TEACHER_AVAILABILITY: "/admin/teacher-availability",
    BULK_BOOKING: "/admin/bulk-booking",
    TEACHERS_DASHBOARD: "/admin/teachers-dashboard",
    ENROLLMENTS: "/admin/enrollments",
    VOLUNTEERS: "/admin/volunteers",
    ATTENDANCE_CONFIG: "/admin/attendance-config",
    REPORTS: "/admin/reports",
  },
} as const;
