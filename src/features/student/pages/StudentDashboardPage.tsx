import { Link } from "react-router-dom";

import { ROUTES } from "../../../constants/RouteConstants";
import { useAuth } from "../../auth/hooks/useAuth";
import "../styles/student.css";

const actions = [
  { path: ROUTES.STUDENT.SLOTS, icon: "📅", title: "Book Slot", description: "Book your exam slot" },
  { path: ROUTES.STUDENT.GRADES, icon: "🏆", title: "Exam History", description: "See your test results" },
  { path: ROUTES.STUDENT.ATTENDANCE, icon: "📋", title: "Attendance", description: "Check your attendance" },
] as const;

function StudentDashboardPage() {
  const { currentUser } = useAuth();

  return (
    <div className="student-page">
      <section className="student-welcome" aria-labelledby="student-welcome-title">
        <p>Welcome back</p>
        <h1 id="student-welcome-title">{currentUser?.name}</h1>
        <div className="student-badges">
          <span>{currentUser?.volunteerId}</span>
          {currentUser?.groupId && <span>Group {currentUser.groupId}</span>}
        </div>
      </section>
      <nav className="student-action-grid" aria-label="Student actions">
        {actions.map((action) => (
          <Link key={action.path} className="student-action" to={action.path}>
            <span className="student-action__icon" aria-hidden="true">{action.icon}</span>
            <strong>{action.title}</strong>
            <span>{action.description}</span>
          </Link>
        ))}
        <div className="student-action student-action--disabled" aria-disabled="true">
          <span className="student-action__icon" aria-hidden="true">📈</span>
          <strong>Analytics</strong>
          <span>Your stats overview</span>
          <small>Coming Soon</small>
        </div>
      </nav>
    </div>
  );
}

export default StudentDashboardPage;
