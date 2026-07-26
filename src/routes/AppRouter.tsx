import { lazy, Suspense } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";

import { ROUTES } from "../constants/RouteConstants";
import ProtectedRoute from "../features/auth/components/ProtectedRoute";
import StudentRoute from "../features/student/components/StudentRoute";
import LoginPage from "../features/auth/pages/LoginPage";
import AuthenticatedLayout from "../layouts/AuthenticatedLayout";
import PublicLayout from "../layouts/PublicLayout";
import HomePage from "../pages/common/HomePage";

const DashboardPage = lazy(() => import("../pages/common/DashboardPage"));
const StudentSlotsPage = lazy(() => import("../features/student/pages/StudentSlotsPage"));
const StudentGradesPage = lazy(() => import("../features/student/pages/StudentGradesPage"));
const StudentAttendancePage = lazy(() => import("../features/student/pages/StudentAttendancePage"));

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
          <Route
            path={ROUTES.STUDENT.SLOTS}
            element={<StudentRoute><Suspense fallback={<div className="app-content__loading" role="status">Loading...</div>}><StudentSlotsPage /></Suspense></StudentRoute>}
          />
          <Route
            path={ROUTES.STUDENT.GRADES}
            element={<StudentRoute><Suspense fallback={<div className="app-content__loading" role="status">Loading...</div>}><StudentGradesPage /></Suspense></StudentRoute>}
          />
          <Route
            path={ROUTES.STUDENT.ATTENDANCE}
            element={<StudentRoute><Suspense fallback={<div className="app-content__loading" role="status">Loading...</div>}><StudentAttendancePage /></Suspense></StudentRoute>}
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;
