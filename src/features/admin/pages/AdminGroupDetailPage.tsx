import { useCallback } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { ROUTES } from "../../../constants/RouteConstants";
import AdminCard from "../components/AdminCard";
import AdminPageHeader from "../components/AdminPageHeader";
import AdminState from "../components/AdminState";
import { useAdminResource } from "../hooks/useAdminResource";
import adminService from "../services/AdminService";
import "../styles/admin.css";

function AdminGroupDetailPage() {
  const { groupId = "" } = useParams();
  const location = useLocation();
  const groupName = typeof location.state === "object" && location.state !== null && "groupName" in location.state && typeof location.state.groupName === "string" ? location.state.groupName : undefined;
  const load = useCallback(() => adminService.getVolunteers({ groupId, status: "ACTIVE", enrollmentType: "S" }), [groupId]);
  const { data, loading, error, reload } = useAdminResource(load, "Failed to load group students.");
  const students = data?.volunteers ?? [];
  return (
    <div className="admin-page">
      <AdminPageHeader
        title={groupName ?? `Group ${groupId}`}
        description="Active student learning report for this configured group."
        action={<Link className="admin-button admin-button--secondary" to={ROUTES.ADMIN.REPORTS}>Back to Reports</Link>}
      />
      {loading && <AdminState type="loading" message="Loading group students..." />}
      {!loading && error && <AdminState type="error" message={error} onRetry={() => void reload()} />}
      {!loading && data && (
        <>
          <section className="admin-operations-section" aria-labelledby="group-report-summary-title">
            <div className="admin-section-heading"><div><h2 id="group-report-summary-title">Group Summary</h2><p>Active students and learning-track distribution.</p></div></div>
            <div className="admin-stats">
              <div><strong>{data.total}</strong><span>Active Students</span></div>
              <div><strong>{students.filter((student) => student.trackType === "MEM").length}</strong><span>Memorization</span></div>
              <div><strong>{students.filter((student) => student.trackType === "FLUENT").length}</strong><span>Fluent Reading</span></div>
              <div><strong>{students.filter((student) => student.slotEligible).length}</strong><span>Slot Eligible</span></div>
            </div>
          </section>
          <AdminCard title="Detailed Student Report" label={`${data.total} Students`}>
            {students.length === 0 ? <AdminState type="empty" message="No active students were found in this group." /> : (
              <div className="admin-table-wrap"><table className="admin-table admin-report-table"><caption className="sr-only">Active students in {groupName ?? `group ${groupId}`}</caption><thead><tr><th>Name</th><th>Volunteer ID</th><th>Track</th><th>Email</th><th>Phone</th><th>Slot Eligible</th></tr></thead><tbody>{students.map((student) => <tr key={student.volunteerId}><td><strong>{student.name}</strong></td><td>{student.volunteerId}</td><td>{student.trackType ?? "-"}</td><td>{student.email ?? "-"}</td><td>{student.phoneNumber ?? "-"}</td><td>{student.slotEligible ? "Yes" : "No"}</td></tr>)}</tbody></table></div>
            )}
          </AdminCard>
        </>
      )}
    </div>
  );
}
export default AdminGroupDetailPage;
