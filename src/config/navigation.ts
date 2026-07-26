import { ROUTES } from "../constants/RouteConstants";

export interface NavigationItemConfig {
  label: string;
  path: string;
}

const dashboardItem: NavigationItemConfig = {
  label: "Dashboard",
  path: ROUTES.DASHBOARD,
};

const studentNavigation: NavigationItemConfig[] = [
  dashboardItem,
  { label: "Book Slot", path: ROUTES.STUDENT.SLOTS },
  { label: "Exam History", path: ROUTES.STUDENT.GRADES },
  { label: "Attendance", path: ROUTES.STUDENT.ATTENDANCE },
];

const teacherNavigation: NavigationItemConfig[] = [
  dashboardItem,
  { label: "Exam Grading", path: ROUTES.TEACHER.DASHBOARD },
  { label: "Attendance", path: ROUTES.TEACHER.ATTENDANCE },
];

const adminNavigation: NavigationItemConfig[] = [
  dashboardItem,
  { label: "Syllabus", path: ROUTES.ADMIN.SYLLABUS },
  {
    label: "Teacher Availability",
    path: ROUTES.ADMIN.TEACHER_AVAILABILITY,
  },
  { label: "Student Slot Booking", path: ROUTES.ADMIN.BULK_BOOKING },
  { label: "Teachers Dashboard", path: ROUTES.ADMIN.TEACHERS_DASHBOARD },
  { label: "New Enrollments", path: ROUTES.ADMIN.ENROLLMENTS },
  { label: "Manage Volunteers", path: ROUTES.ADMIN.VOLUNTEERS },
  { label: "Attendance Config", path: ROUTES.ADMIN.ATTENDANCE_CONFIG },
  { label: "Reports", path: ROUTES.ADMIN.REPORTS },
];

export function getNavigationItems(role: string): NavigationItemConfig[] {
  if (role === "ADMIN") {
    return adminNavigation;
  }

  if (role === "TEACHER") {
    return teacherNavigation;
  }

  return studentNavigation;
}
