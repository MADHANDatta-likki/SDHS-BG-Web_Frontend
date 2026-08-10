import { useCallback } from "react";
import { Link } from "react-router-dom";

import DashboardActions, { type DashboardAction } from "../../../components/common/DashboardActions";
import DashboardPageHeader from "../../../components/common/DashboardPageHeader";
import { ROUTES } from "../../../constants/RouteConstants";
import "../../../theme/dashboard.css";
import { dashboardBackgroundStyle } from "../../../utils/dashboardBackground";
import { useAuth } from "../../auth/hooks/useAuth";
import AdminCard from "../components/AdminCard";
import AdminState from "../components/AdminState";
import { useAdminResource } from "../hooks/useAdminResource";
import adminService from "../services/AdminService";
import "../styles/admin.css";

const primaryActions: readonly DashboardAction[] = [
  { to: ROUTES.ADMIN.VOLUNTEERS, icon: "👥", title: "Manage Volunteers", description: "Search and manage volunteers" },
  { to: ROUTES.ADMIN.ENROLLMENTS, icon: "📝", title: "Manage Enrollments", description: "Review requests and active learning" },
  { to: ROUTES.ADMIN.TEACHER_AVAILABILITY, icon: "🗓️", title: "Teacher Availability", description: "Monitor upcoming availability" },
  { to: ROUTES.ADMIN.REPORTS, icon: "📊", title: "Reports", description: "Review group and track information" },
];

const secondaryActions: readonly DashboardAction[] = [
  { to: ROUTES.ADMIN.SYLLABUS, icon: "📖", title: "Syllabus", description: "Configure weekly exam syllabus" },
  { to: ROUTES.ADMIN.BULK_BOOKING, icon: "🎓", title: "Student Booking", description: "Manage student exam bookings" },
  { to: ROUTES.ADMIN.TEACHERS_DASHBOARD, icon: "✏️", title: "Teacher Grading", description: "Review assignments and grades" },
  { to: ROUTES.ADMIN.ATTENDANCE_CONFIG, icon: "📋", title: "Attendance Config", description: "Configure learning group dates" },
];

function AdminDashboardPage() {
  const { currentUser } = useAuth();
  const load = useCallback(async () => {
    const [volunteers, enrollments, availability] = await Promise.all([
      adminService.getVolunteers(),
      adminService.getEnrollments(),
      adminService.getTeacherAvailability(),
    ]);
    return { volunteers, enrollments, availability };
  }, []);
  const { data, error, loading, reload } = useAdminResource(load, "Failed to load the operations overview.");
  const activeVolunteers = data?.volunteers.volunteers.filter((item) => item.status === "ACTIVE").length ?? 0;
  const inactiveVolunteers = data?.volunteers.volunteers.filter((item) => item.status === "INACTIVE").length ?? 0;
  const droppedVolunteers = data?.volunteers.volunteers.filter((item) => item.status === "DROPPED").length ?? 0;
  const recentVolunteers = [...(data?.volunteers.volunteers ?? [])]
    .filter((volunteer) => Boolean(volunteer.createdAt))
    .sort((left, right) => (right.createdAt ?? "").localeCompare(left.createdAt ?? ""))
    .slice(0, 4);

  return (
    <div className="admin-page dashboard-background dashboard-layout admin-dashboard" style={dashboardBackgroundStyle}>
      <DashboardPageHeader title="Admin Dashboard" invocation="శ్రీ కృష్ణాయ పరమాత్మనే నమః" subtitle="Bhagavad Gita Learning Operations">
        <div className="dashboard-heading__identity"><span>{currentUser?.name}</span><span>{currentUser?.volunteerId}</span></div>
      </DashboardPageHeader>

      {loading && <AdminState type="loading" message="Loading the operations overview..." />}
      {!loading && error && <AdminState type="error" message={error} onRetry={() => void reload()} />}
      {!loading && data && (
        <>
          <section className="admin-dashboard__today" aria-labelledby="admin-overview-title">
            <div className="dashboard-section-heading"><div><h2 id="admin-overview-title">Today's Overview</h2><p>Current enrollment, volunteer, and examination readiness.</p></div></div>
            <div className="admin-stats admin-dashboard__stats">
              <div><strong>{data.enrollments.total}</strong><span>Pending Enrollments</span></div>
              <div><strong>{activeVolunteers}</strong><span>Active Volunteers</span></div>
              <div><strong>{data.availability.summary.submitted}</strong><span>Teachers Available</span></div>
              <div><strong>{data.availability.date}</strong><span>Upcoming Examination</span></div>
            </div>
          </section>

          <section className="admin-dashboard__pending" aria-labelledby="admin-pending-actions-title">
            <div className="dashboard-section-heading"><div><h2 id="admin-pending-actions-title">Pending Actions</h2><p>Operational items that may require administrator attention.</p></div></div>
            <div className="admin-dashboard__work">
            <AdminCard title="Pending Enrollments" label={String(data.enrollments.total)}>
              {data.enrollments.enrollments.length === 0
                ? <AdminState type="empty" message="No enrollment requests are waiting for review." />
                : <ul className="dashboard-summary-list">{data.enrollments.enrollments.slice(0, 4).map((item) => <li key={item.enrollmentId}><div><strong>{item.volunteerName}</strong><span>{item.volunteerId}</span></div><small>{item.programType}</small></li>)}</ul>}
            </AdminCard>
            <AdminCard title="Teacher Availability Pending" label={data.availability.date}>
              <div className="dashboard-metric"><strong>{data.availability.summary.pending}</strong><span>of {data.availability.summary.teachers} teachers pending</span></div>
              <p className="dashboard-guidance">{data.availability.summary.pending === 0 ? "All active teachers have submitted availability." : `${data.availability.summary.pending} teachers still need to submit availability.`}</p>
            </AdminCard>
            <AdminCard title="Inactive Volunteers" label={String(inactiveVolunteers)}>
              <div className="dashboard-metric"><strong>{inactiveVolunteers}</strong><span>inactive volunteer accounts</span></div>
              <p className="dashboard-guidance">Review volunteer status and reactivate accounts when appropriate.</p>
            </AdminCard>
            </div>
          </section>

          <section className="admin-dashboard__operations" aria-labelledby="admin-volunteer-overview-title">
            <div className="dashboard-section-heading"><div><h2 id="admin-volunteer-overview-title">Volunteer Overview</h2><p>Registration activity and access to volunteer operations.</p></div></div>
            <div className="admin-dashboard__overview-grid">
              <AdminCard title="Volunteer Operations" label={`${data.volunteers.total} total`}>
                <div className="admin-dashboard__inline-metrics">
                  <span><strong>{activeVolunteers}</strong> Active</span>
                  <span><strong>{inactiveVolunteers}</strong> Inactive</span>
                  <span><strong>{droppedVolunteers}</strong> Dropped</span>
                </div>
                <p className="dashboard-guidance">Manage volunteers, open individual analytics, and export the filtered volunteer list from one workspace.</p>
                <div className="admin-row-actions"><Link className="admin-button admin-button--primary" to={ROUTES.ADMIN.VOLUNTEERS}>Open Volunteer Operations</Link></div>
              </AdminCard>
              <AdminCard title="Recent Activity" label="New Volunteers">
                {recentVolunteers.length === 0
                  ? <AdminState type="empty" message="No recent volunteer registrations are available." />
                  : <ul className="dashboard-summary-list">{recentVolunteers.map((item) => <li key={item.volunteerId}><div><strong>{item.name}</strong><span>{item.volunteerId}</span></div><small>{item.createdAt ? new Date(item.createdAt).toLocaleDateString() : ""}</small></li>)}</ul>}
              </AdminCard>
            </div>
          </section>

          <section className="admin-dashboard__readiness" aria-labelledby="admin-teacher-readiness-title">
            <div className="dashboard-section-heading"><div><h2 id="admin-teacher-readiness-title">Teacher Readiness</h2><p>Availability coverage for the upcoming examination.</p></div></div>
            <AdminCard title="Upcoming Examination" label={data.availability.date}>
              <div className="admin-dashboard__inline-metrics">
                <span><strong>{data.availability.summary.submitted}</strong> Submitted</span>
                <span><strong>{data.availability.summary.pending}</strong> Pending</span>
                <span><strong>{data.availability.summary.availabilityWindows}</strong> Availability Windows</span>
              </div>
              <div className="admin-row-actions"><Link className="admin-button admin-button--secondary" to={ROUTES.ADMIN.TEACHER_AVAILABILITY}>Review Teacher Readiness</Link></div>
            </AdminCard>
          </section>
        </>
      )}

      <section className="dashboard-quick-actions" aria-labelledby="admin-quick-actions-title">
        <div className="dashboard-section-heading"><div><h2 id="admin-quick-actions-title">Quick Administration</h2><p>Open the most common administration workspaces.</p></div></div>
        <DashboardActions actions={primaryActions} ariaLabel="Primary admin actions" />
        <details className="admin-dashboard__more-actions">
          <summary>More administration tools</summary>
          <DashboardActions actions={secondaryActions} ariaLabel="Additional admin actions" />
        </details>
      </section>
    </div>
  );
}

export default AdminDashboardPage;
