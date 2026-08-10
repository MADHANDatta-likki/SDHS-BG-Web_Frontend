export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  DASHBOARD: "/dashboard",
  STUDENT: {
    MY_LEARNING: "/student/my-learning",
    NEW_ENROLLMENT: "/student/enrollments/new",
    SLOTS: "/student/slots",
    GRADES: "/student/grades",
    ATTENDANCE: "/student/attendance",
  },
  TEACHER: {
    MY_AVAILABILITY: "/teacher/my-availability",
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
    VOLUNTEER_ANALYTICS: "/admin/volunteers/:volunteerId/analytics",
    GROUP_DETAIL: "/admin/reports/groups/:groupId",
  },
} as const;

export function getPostLoginRoute(role: string): string {
  return role === "STUDENT"
    ? ROUTES.STUDENT.MY_LEARNING
    : ROUTES.DASHBOARD;
}
