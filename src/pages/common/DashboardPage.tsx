import { useAuth } from "../../features/auth/hooks/useAuth";
import StudentDashboardPage from "../../features/student/pages/StudentDashboardPage";

function DashboardPage() {
  const { currentUser } = useAuth();

  if (currentUser?.role === "STUDENT") {
    return <StudentDashboardPage />;
  }

  return <h1>Dashboard</h1>;
}

export default DashboardPage;
