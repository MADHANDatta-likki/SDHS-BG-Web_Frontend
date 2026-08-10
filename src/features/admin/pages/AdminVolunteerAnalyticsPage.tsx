import { useCallback } from "react";
import { Link, useParams } from "react-router-dom";
import { ROUTES } from "../../../constants/RouteConstants";
import { isSupplementalChapter } from "../../../utils/chapterLabel";
import AdminCard from "../components/AdminCard";
import AdminPageHeader from "../components/AdminPageHeader";
import AdminState from "../components/AdminState";
import { useAdminResource } from "../hooks/useAdminResource";
import adminService from "../services/AdminService";
import "../styles/admin.css";

function AdminVolunteerAnalyticsPage() {
  const { volunteerId = "" } = useParams();
  const load = useCallback(() => adminService.getVolunteerAnalytics(volunteerId), [volunteerId]);
  const { data, loading, error, reload } = useAdminResource(load, "Failed to load volunteer analytics.");
  return (
    <div className="admin-page">
      <AdminPageHeader
        title="Volunteer Analytics"
        description="Individual learning, examination, and grading history."
        action={<Link className="admin-button admin-button--secondary" to={ROUTES.ADMIN.VOLUNTEERS}>Back to Volunteers</Link>}
      />
      {loading && <AdminState type="loading" message="Loading analytics..." />}
      {!loading && error && <AdminState type="error" message={error} onRetry={() => void reload()} />}
      {!loading && data && (
        <>
          <section className="admin-profile admin-report-profile">
            <div><h2>{data.volunteer.name}</h2><p>{data.volunteer.email ?? ""}{data.volunteer.email && data.volunteer.phoneNumber ? " · " : ""}{data.volunteer.phoneNumber ?? ""}</p></div>
            <div className="admin-report-profile__badges"><span>{data.volunteer.volunteerId}</span><span>{data.volunteer.status}</span>{data.volunteer.groupId && <span>Group {data.volunteer.groupId}</span>}</div>
          </section>

          <section className="admin-operations-section" aria-labelledby="examination-statistics-title">
            <div className="admin-section-heading"><div><h2 id="examination-statistics-title">Examination Statistics</h2><p>Existing booking, evaluation, and grade summary.</p></div></div>
            <div className="admin-stats">
              <div><strong>{data.totalBookings}</strong><span>Examinations</span></div>
              <div><strong>{data.gradedCount}</strong><span>Completed Evaluations</span></div>
              <div><strong>{data.pendingCount}</strong><span>Pending Evaluations</span></div>
              <div><strong>{data.totalSlokas}</strong><span>Slokas</span></div>
              <div><strong>{data.avgMem}</strong><span>Avg. Memorization</span></div>
              <div><strong>{data.avgPro}</strong><span>Avg. Pronunciation</span></div>
            </div>
          </section>

          <AdminCard title="Detailed Examination Report" label={`${data.bookings.length} Records`}>
            {data.bookings.length === 0 ? <AdminState type="empty" message="No examination history was found for this volunteer." /> : (
              <div className="admin-table-wrap"><table className="admin-table admin-report-table"><caption className="sr-only">Examination history for {data.volunteer.name}</caption><thead><tr><th>Date</th><th>Slot</th><th>Chapter</th><th>Slokas</th><th>Mem.</th><th>Pron.</th><th>Teacher</th><th>Comment</th></tr></thead><tbody>{data.bookings.map((booking) => <tr key={booking.id}><td>{booking.formattedDate ?? booking.date}</td><td>{booking.slotName ?? "-"}</td><td>{isSupplementalChapter(booking.chapterName) ? booking.chapterName : `${booking.chapterNumber} ${booking.chapterName}`}</td><td>{booking.slokaCount ?? "-"}</td><td>{booking.memorizationGrade ?? "-"}</td><td>{booking.pronunciationGrade ?? "-"}</td><td>{booking.assignedTeacherName ?? "-"}</td><td className="admin-report-table__comment">{booking.teacherComment ?? "-"}</td></tr>)}</tbody></table></div>
            )}
          </AdminCard>
        </>
      )}
    </div>
  );
}
export default AdminVolunteerAnalyticsPage;
