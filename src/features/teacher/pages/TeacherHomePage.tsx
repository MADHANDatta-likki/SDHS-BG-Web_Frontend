import { useCallback, useMemo } from "react";

import DashboardActions, { type DashboardAction } from "../../../components/common/DashboardActions";
import DashboardPageHeader from "../../../components/common/DashboardPageHeader";
import { ROUTES } from "../../../constants/RouteConstants";
import "../../../theme/dashboard.css";
import { dashboardBackgroundStyle } from "../../../utils/dashboardBackground";
import { useAuth } from "../../auth/hooks/useAuth";
import TeacherCard from "../components/TeacherCard";
import TeacherState from "../components/TeacherState";
import { useTeacherResource } from "../hooks/useTeacherResource";
import teacherService from "../services/TeacherService";
import "../styles/teacher.css";

const actions: readonly DashboardAction[] = [
  { to: ROUTES.TEACHER.ATTENDANCE, icon: "📋", title: "Attendance", description: "Record learning-group attendance" },
  { to: ROUTES.TEACHER.MY_AVAILABILITY, icon: "🗓️", title: "My Availability", description: "Update upcoming exam availability" },
  { to: ROUTES.TEACHER.DASHBOARD, icon: "✏️", title: "Pending Grading", description: "Complete pending student evaluations" },
  { to: ROUTES.DASHBOARD, icon: "⌂", title: "Dashboard", description: "Return to your examiner overview" },
];

function todayIsoDate(): string {
  const today = new Date();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${today.getFullYear()}-${month}-${day}`;
}

function TeacherHomePage() {
  const { currentUser } = useAuth();
  const load = useCallback(async () => {
    const [home, availability, grading] = await Promise.all([
      teacherService.getHome(),
      teacherService.getMyAvailability(),
      teacherService.getDashboard(),
    ]);
    return { home, availability, grading };
  }, []);
  const { data, error, loading, reload } = useTeacherResource(load, "Failed to load teacher dashboard.");
  const today = todayIsoDate();
  const { todayBookings, upcomingBookings, evaluatedBookings } = useMemo(() => {
    const activeBookings = (data?.grading.bookings ?? []).filter((booking) => !booking.cancelled);
    return {
      todayBookings: activeBookings.filter((booking) => booking.date === today),
      upcomingBookings: [...activeBookings]
        .filter((booking) => Boolean(booking.date) && booking.date! >= today)
        .sort((left, right) => (left.date ?? "").localeCompare(right.date ?? ""))
        .slice(0, 4),
      evaluatedBookings: [...activeBookings]
        .filter((booking) => Boolean(booking.memorizationGrade?.trim()))
        .sort((left, right) => (right.date ?? "").localeCompare(left.date ?? ""))
        .slice(0, 3),
    };
  }, [data?.grading.bookings, today]);

  return (
    <div className="teacher-page dashboard-background dashboard-layout teacher-dashboard" style={dashboardBackgroundStyle}>
      <DashboardPageHeader title="Teacher Dashboard" invocation="శ్రీ కృష్ణాయ పరమాత్మనే నమః" subtitle="Your teaching and examination workspace">
        <div className="dashboard-heading__identity"><span>{currentUser?.name}</span><span>{currentUser?.volunteerId}</span></div>
      </DashboardPageHeader>

      <section className="dashboard-quick-actions" aria-labelledby="teacher-quick-actions-title">
        <div className="dashboard-section-heading"><div><h2 id="teacher-quick-actions-title">Quick Actions</h2><p>Open your teaching and examination tools.</p></div></div>
        <DashboardActions actions={actions} ariaLabel="Teacher quick actions" />
      </section>

      {loading && <TeacherState type="loading" message="Loading today's teaching workspace..." />}
      {!loading && error && <TeacherState type="error" message={error} onRetry={() => void reload()} />}
      {!loading && data && (
        <div className="teacher-dashboard__flow">
          <section className="teacher-dashboard__today" aria-labelledby="teacher-overview-title">
            <div className="dashboard-section-heading"><div><h2 id="teacher-overview-title">Today&apos;s Teaching</h2><p>Your current examination and evaluation workload.</p></div></div>
            <div className="teacher-stats teacher-dashboard__stats">
              <div><strong>{todayBookings.length}</strong><span>Today&apos;s Exams</span></div>
              <div><strong>{data.home.uniqueStudents}</strong><span>Assigned Students</span></div>
              <div><strong>{data.availability.selectedSlotIds.length > 0 ? "Submitted" : "Pending"}</strong><span>Availability Status</span></div>
              <div><strong>{data.home.pendingCount}</strong><span>Pending Grading</span></div>
            </div>
          </section>

          <section className="teacher-dashboard__upcoming" aria-labelledby="teacher-upcoming-title">
            <div className="dashboard-section-heading"><div><h2 id="teacher-upcoming-title">Upcoming Examinations</h2><p>Your assigned examination work queue.</p></div></div>
            <TeacherCard title="Assigned Exams" label={`${upcomingBookings.length} upcoming`}>
              {upcomingBookings.length === 0
                ? <TeacherState type="empty" message="No assigned exams are currently waiting for you." />
                : <ul className="teacher-exam-work-list">{upcomingBookings.map((booking) => <li key={booking.id}><div className="teacher-exam-work-list__identity"><strong>{booking.studentName}</strong><span>{booking.studentVolunteerId}</span>{booking.studentPhone && <span><a href={`tel:${booking.studentPhone}`} style={{ color: "inherit" }}>{booking.studentPhone}</a></span>}</div><div><strong>{booking.chapterName ?? `Chapter ${booking.chapterNumber ?? ""}`}</strong><span>{booking.slotName ?? "Time not listed"}</span></div><time dateTime={booking.date ?? undefined}>{booking.formattedDate ?? booking.date ?? ""}</time><span className="teacher-badge">Assigned</span></li>)}</ul>}
            </TeacherCard>
          </section>

          <section className="teacher-dashboard__evaluation" aria-labelledby="teacher-evaluation-title">
            <div className="dashboard-section-heading"><div><h2 id="teacher-evaluation-title">Pending Evaluation</h2><p>Grading progress and recently evaluated examinations.</p></div></div>
            <div className="teacher-dashboard__work teacher-dashboard__work--evaluation">
            <TeacherCard title="Evaluation Summary">
              <div className="dashboard-compact-metrics"><div><span>Waiting for Grading</span><strong>{data.home.pendingCount}</strong></div><div><span>Completed Grading</span><strong>{data.home.gradedCount}</strong></div><div><span>Memorization Average</span><strong>{data.home.avgMem}</strong></div><div><span>Pronunciation Average</span><strong>{data.home.avgPro}</strong></div></div>
            </TeacherCard>
            <TeacherCard title="Recent Evaluations" label={String(evaluatedBookings.length)}>
              {evaluatedBookings.length === 0
                ? <TeacherState type="empty" message="No completed evaluations are available yet." />
                : <ul className="dashboard-summary-list">{evaluatedBookings.map((booking) => <li key={booking.id}><div><strong>{booking.studentName}</strong><span>{booking.chapterName ?? `Chapter ${booking.chapterNumber ?? ""}`}</span></div><small>{booking.formattedDate ?? booking.date ?? ""}</small></li>)}</ul>}
            </TeacherCard>
            </div>
          </section>

          <section className="teacher-dashboard__summary" aria-label="Teacher summary">
            <TeacherCard title="Attendance" label={`${data.home.totalSessions} sessions`}>
              <div className="dashboard-metric"><strong>{data.home.totalSessions}</strong><span>teaching sessions recorded</span></div>
              <p className="dashboard-guidance">Open attendance to review the current week and record student participation.</p>
            </TeacherCard>
            <TeacherCard title="Availability" label={data.availability.examDate}>
              <div className="dashboard-metric"><strong>{data.availability.selectedSlotIds.length}</strong><span>time windows selected</span></div>
              <p className="dashboard-guidance">{data.availability.selectedSlotIds.length > 0 ? "Your availability is submitted for the upcoming examination." : "Availability is pending. Add your time windows before booking begins."}</p>
            </TeacherCard>
          </section>
        </div>
      )}

    </div>
  );
}

export default TeacherHomePage;
