import { lazy, Suspense } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";

import { ROUTES } from "../constants/RouteConstants";
import ProtectedRoute from "../features/auth/components/ProtectedRoute";
import StudentRoute from "../features/student/components/StudentRoute";
import RequireEnrollment from "../features/enrollment/components/RequireEnrollment";
import TeacherRoute from "../features/teacher/components/TeacherRoute";
import AdminRoute from "../features/admin/components/AdminRoute";
import LoginPage from "../features/auth/pages/LoginPage";
import AuthenticatedLayout from "../layouts/AuthenticatedLayout";
import PublicLayout from "../layouts/PublicLayout";
import HomePage from "../pages/common/HomePage";

const DashboardPage = lazy(() => import("../pages/common/DashboardPage"));
const MyLearningPage = lazy(() => import("../features/enrollment/pages/MyLearningPage"));
const NewEnrollmentPage = lazy(() => import("../features/enrollment/pages/NewEnrollmentPage"));
const StudentSlotsPage = lazy(() => import("../features/student/pages/StudentSlotsPage"));
const StudentGradesPage = lazy(() => import("../features/student/pages/StudentGradesPage"));
const StudentAttendancePage = lazy(() => import("../features/student/pages/StudentAttendancePage"));
const TeacherGradingPage = lazy(() => import("../features/teacher/pages/TeacherGradingPage"));
const TeacherAvailabilityPage = lazy(() => import("../features/teacher/pages/TeacherAvailabilityPage"));
const TeacherAttendancePage = lazy(() => import("../features/teacher/pages/TeacherAttendancePage"));
const AdminSyllabusPage = lazy(() => import("../features/admin/pages/AdminSyllabusPage"));
const AdminTeacherAvailabilityPage = lazy(() => import("../features/admin/pages/AdminTeacherAvailabilityPage"));
const AdminBulkBookingPage = lazy(() => import("../features/admin/pages/AdminBulkBookingPage"));
const AdminTeachersDashboardPage = lazy(() => import("../features/admin/pages/AdminTeachersDashboardPage"));
const AdminEnrollmentsPage = lazy(() => import("../features/admin/pages/AdminEnrollmentsPage"));
const AdminVolunteersPage = lazy(() => import("../features/admin/pages/AdminVolunteersPage"));
const AdminVolunteerAnalyticsPage = lazy(() => import("../features/admin/pages/AdminVolunteerAnalyticsPage"));
const AdminAttendanceConfigPage = lazy(() => import("../features/admin/pages/AdminAttendanceConfigPage"));
const AdminReportsPage = lazy(() => import("../features/admin/pages/AdminReportsPage"));
const AdminGroupDetailPage = lazy(() => import("../features/admin/pages/AdminGroupDetailPage"));
const AccountSettingsPage = lazy(() => import("../features/profile/pages/AccountSettingsPage"));

const routeFallback = <div className="app-content__loading" role="status">Loading...</div>;

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path={ROUTES.HOME}
          element={
            <PublicLayout>
              <HomePage />
            </PublicLayout>
          }
        />
        <Route
          path={ROUTES.LOGIN}
          element={
            <PublicLayout>
              <LoginPage />
            </PublicLayout>
          }
        />
        <Route
          element={
            <ProtectedRoute>
              <AuthenticatedLayout />
            </ProtectedRoute>
          }
        >
          <Route
            path={ROUTES.DASHBOARD}
            element={
              <Suspense
                fallback={
                  <div className="app-content__loading" role="status">
                    Loading...
                  </div>
                }
              >
                <DashboardPage />
              </Suspense>
            }
          />
          <Route path={ROUTES.ACCOUNT_SETTINGS} element={<Suspense fallback={routeFallback}><AccountSettingsPage /></Suspense>} />
          <Route
            path={ROUTES.STUDENT.MY_LEARNING}
            element={
              <StudentRoute>
                <Suspense fallback={routeFallback}>
                  <MyLearningPage />
                </Suspense>
              </StudentRoute>
            }
          />
          <Route
            path={ROUTES.STUDENT.NEW_ENROLLMENT}
            element={
              <StudentRoute>
                <Suspense fallback={routeFallback}>
                  <NewEnrollmentPage />
                </Suspense>
              </StudentRoute>
            }
          />
          <Route
            path={ROUTES.STUDENT.SLOTS}
            element={
              <StudentRoute>
                <RequireEnrollment requiresExam>
                  <Suspense fallback={routeFallback}>
                    <StudentSlotsPage />
                  </Suspense>
                </RequireEnrollment>
              </StudentRoute>
            }
          />
          <Route
            path={ROUTES.STUDENT.GRADES}
            element={
              <StudentRoute>
                <RequireEnrollment requiresExam>
                  <Suspense fallback={routeFallback}>
                    <StudentGradesPage />
                  </Suspense>
                </RequireEnrollment>
              </StudentRoute>
            }
          />
          <Route
            path={ROUTES.STUDENT.ATTENDANCE}
            element={
              <StudentRoute>
                <RequireEnrollment>
                  <Suspense fallback={routeFallback}>
                    <StudentAttendancePage />
                  </Suspense>
                </RequireEnrollment>
              </StudentRoute>
            }
          />
          <Route
            path={ROUTES.TEACHER.MY_AVAILABILITY}
            element={<TeacherRoute><Suspense fallback={routeFallback}><TeacherAvailabilityPage /></Suspense></TeacherRoute>}
          />
          <Route
            path={ROUTES.TEACHER.DASHBOARD}
            element={<TeacherRoute><Suspense fallback={<div className="app-content__loading" role="status">Loading...</div>}><TeacherGradingPage /></Suspense></TeacherRoute>}
          />
          <Route
            path={ROUTES.TEACHER.ATTENDANCE}
            element={<TeacherRoute><Suspense fallback={<div className="app-content__loading" role="status">Loading...</div>}><TeacherAttendancePage /></Suspense></TeacherRoute>}
          />
          <Route path={ROUTES.ADMIN.SYLLABUS} element={<AdminRoute><Suspense fallback={routeFallback}><AdminSyllabusPage /></Suspense></AdminRoute>} />
          <Route path={ROUTES.ADMIN.TEACHER_AVAILABILITY} element={<AdminRoute><Suspense fallback={routeFallback}><AdminTeacherAvailabilityPage /></Suspense></AdminRoute>} />
          <Route path={ROUTES.ADMIN.BULK_BOOKING} element={<AdminRoute><Suspense fallback={routeFallback}><AdminBulkBookingPage /></Suspense></AdminRoute>} />
          <Route path={ROUTES.ADMIN.TEACHERS_DASHBOARD} element={<AdminRoute><Suspense fallback={routeFallback}><AdminTeachersDashboardPage /></Suspense></AdminRoute>} />
          <Route path={ROUTES.ADMIN.ENROLLMENTS} element={<AdminRoute><Suspense fallback={routeFallback}><AdminEnrollmentsPage /></Suspense></AdminRoute>} />
          <Route path={ROUTES.ADMIN.VOLUNTEERS} element={<AdminRoute><Suspense fallback={routeFallback}><AdminVolunteersPage /></Suspense></AdminRoute>} />
          <Route path={ROUTES.ADMIN.VOLUNTEER_ANALYTICS} element={<AdminRoute><Suspense fallback={routeFallback}><AdminVolunteerAnalyticsPage /></Suspense></AdminRoute>} />
          <Route path={ROUTES.ADMIN.ATTENDANCE_CONFIG} element={<AdminRoute><Suspense fallback={routeFallback}><AdminAttendanceConfigPage /></Suspense></AdminRoute>} />
          <Route path={ROUTES.ADMIN.REPORTS} element={<AdminRoute><Suspense fallback={routeFallback}><AdminReportsPage /></Suspense></AdminRoute>} />
          <Route path={ROUTES.ADMIN.GROUP_DETAIL} element={<AdminRoute><Suspense fallback={routeFallback}><AdminGroupDetailPage /></Suspense></AdminRoute>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;
