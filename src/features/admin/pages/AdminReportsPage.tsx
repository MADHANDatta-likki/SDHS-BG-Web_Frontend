import { useCallback } from "react";
import { Link } from "react-router-dom";
import { ROUTES } from "../../../constants/RouteConstants";
import AdminCard from "../components/AdminCard";
import AdminPageHeader from "../components/AdminPageHeader";
import AdminState from "../components/AdminState";
import { useAdminResource } from "../hooks/useAdminResource";
import adminService from "../services/AdminService";
import "../styles/admin.css";

function AdminReportsPage() {
  const load = useCallback(async () => {
    const [config, volunteers] = await Promise.all([adminService.getAttendanceConfig(), adminService.getVolunteers({ enrollmentType: "S" })]);
    return { config, volunteers };
  }, []);
  const { data, loading, error, reload } = useAdminResource(load, "Failed to load reports.");
  const count = (groupId: string, track?: string) => data?.volunteers.volunteers.filter((student) => student.groupId === groupId && (!track || student.trackType === track)).length ?? 0;
  const students = data?.volunteers.volunteers ?? [];
  const memorizationStudents = students.filter((student) => student.trackType === "MEM").length;
  const fluentStudents = students.filter((student) => student.trackType === "FLUENT").length;
  const activeStudents = students.filter((student) => student.status === "ACTIVE").length;
  const activeGroups = data?.config.groups.filter((group) => group.status === "ACTIVE").length ?? 0;
  return (
    <div className="admin-page">
      <AdminPageHeader title="Reports & Analytics" description="Review the learning and volunteer information exposed by the existing reporting services." />
      {loading && <AdminState type="loading" message="Loading reports..." />}
      {!loading && error && <AdminState type="error" message={error} onRetry={() => void reload()} />}
      {!loading && data && (
        <>
          <section className="admin-operations-section" aria-labelledby="learning-overview-title">
            <div className="admin-section-heading"><div><h2 id="learning-overview-title">Learning Overview</h2><p>Current student and configured-group coverage.</p></div></div>
            <div className="admin-stats">
              <div><strong>{data.volunteers.total}</strong><span>Total Students</span></div>
              <div><strong>{activeStudents}</strong><span>Active Students</span></div>
              <div><strong>{data.config.groups.length}</strong><span>Configured Groups</span></div>
              <div><strong>{activeGroups}</strong><span>Active Groups</span></div>
            </div>
          </section>

          <section className="admin-operations-section" aria-labelledby="volunteer-statistics-title">
            <div className="admin-section-heading"><div><h2 id="volunteer-statistics-title">Volunteer Statistics</h2><p>Student distribution by learning track from the loaded volunteer report.</p></div></div>
            <div className="admin-stats admin-report-stats--compact">
              <div><strong>{memorizationStudents}</strong><span>Memorization</span></div>
              <div><strong>{fluentStudents}</strong><span>Fluent Reading</span></div>
            </div>
          </section>

          <section className="admin-operations-section" aria-labelledby="report-navigation-title">
            <div className="admin-section-heading"><div><h2 id="report-navigation-title">Report Navigation</h2><p>Open the report views currently available in React.</p></div></div>
          <AdminCard title="Group Reports" label={`${data.config.groups.length} Groups`}>
            {data.config.groups.length === 0 ? <AdminState type="empty" message="No configured groups are available for reporting." /> : (
              <div className="admin-tile-grid admin-report-navigation-grid">
                {data.config.groups.map((group) => (
                  <Link className="admin-tile admin-tile--link" key={group.groupId} to={`${ROUTES.ADMIN.REPORTS}/groups/${encodeURIComponent(group.groupId)}`} state={{ groupName: group.groupName }}>
                    <h3>{group.groupName ?? `Group ${group.groupId}`}</h3>
                    <p>{group.groupId} · {group.status}</p>
                    <dl><div><dt>Students</dt><dd>{count(group.groupId)}</dd></div><div><dt>MEM</dt><dd>{count(group.groupId, "MEM")}</dd></div><div><dt>FLUENT</dt><dd>{count(group.groupId, "FLUENT")}</dd></div></dl>
                  </Link>
                ))}
              </div>
            )}
          </AdminCard>
          <AdminCard title="Volunteer Analytics" label="Individual Report">
            <div className="admin-report-navigation-row">
              <div><strong>Volunteer learning and examination analytics</strong><p>Select a volunteer from Manage Volunteers to review bookings, grading, slokas, and assigned teachers.</p></div>
              <Link className="admin-button admin-button--secondary" to={ROUTES.ADMIN.VOLUNTEERS}>Select Volunteer</Link>
            </div>
          </AdminCard>
          </section>
        </>
      )}
    </div>
  );
}
export default AdminReportsPage;
