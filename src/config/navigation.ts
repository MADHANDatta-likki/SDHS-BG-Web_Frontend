import { ROUTES } from "../constants/RouteConstants";

export interface NavigationItemConfig {
  label: string;
  path: string;
}

const dashboardItem: NavigationItemConfig = {
  label: "Dashboard",
  path: ROUTES.DASHBOARD,
};

const accountSettingsItem: NavigationItemConfig = {
  label: "Account Settings",
  path: ROUTES.ACCOUNT_SETTINGS,
};

const studentNavigation: NavigationItemConfig[] = [
  { label: "My Learning", path: ROUTES.STUDENT.MY_LEARNING },
  accountSettingsItem,
];

const teacherNavigation: NavigationItemConfig[] = [
  dashboardItem,
  { label: "My Availability", path: ROUTES.TEACHER.MY_AVAILABILITY },
  { label: "Exam Grading", path: ROUTES.TEACHER.DASHBOARD },
  { label: "Attendance", path: ROUTES.TEACHER.ATTENDANCE },
  accountSettingsItem,
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
  accountSettingsItem,
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
