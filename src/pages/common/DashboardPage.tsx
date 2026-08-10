import { useAuth } from "../../features/auth/hooks/useAuth";
import RequireEnrollment from "../../features/enrollment/components/RequireEnrollment";
import StudentDashboardPage from "../../features/student/pages/StudentDashboardPage";
import TeacherHomePage from "../../features/teacher/pages/TeacherHomePage";
import AdminDashboardPage from "../../features/admin/pages/AdminDashboardPage";

function DashboardPage() {
  const { currentUser } = useAuth();

  if (currentUser?.role === "STUDENT") {
    return (
      <RequireEnrollment>
        <StudentDashboardPage />
      </RequireEnrollment>
    );
  }

  if (currentUser?.role === "TEACHER") {
    return <TeacherHomePage />;
  }

  if (currentUser?.role === "ADMIN") {
    return <AdminDashboardPage />;
  }

  return <h1>Dashboard</h1>;
}

export default DashboardPage;
