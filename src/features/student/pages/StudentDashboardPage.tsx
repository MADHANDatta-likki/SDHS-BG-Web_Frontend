import { useCallback } from "react";

import DashboardActions, { type DashboardAction } from "../../../components/common/DashboardActions";
import DashboardPageHeader from "../../../components/common/DashboardPageHeader";
import { ROUTES } from "../../../constants/RouteConstants";
import { useEnrollment } from "../../../hooks/useEnrollment";
import "../../../theme/dashboard.css";
import { dashboardBackgroundStyle } from "../../../utils/dashboardBackground";
import { useAuth } from "../../auth/hooks/useAuth";
import CurrentEnrollmentSummary from "../../enrollment/components/CurrentEnrollmentSummary";
import StudentCard from "../components/StudentCard";
import StudentState from "../components/StudentState";
import { useStudentResource } from "../hooks/useStudentResource";
import studentService from "../services/StudentService";
import "../styles/student.css";

const examActions: readonly DashboardAction[] = [
  { to: ROUTES.STUDENT.SLOTS, icon: "📅", title: "Book Slot", description: "Book your upcoming exam" },
  { to: ROUTES.STUDENT.ATTENDANCE, icon: "📋", title: "Attendance", description: "View your class attendance" },
  { to: ROUTES.STUDENT.GRADES, icon: "🏆", title: "Exam History", description: "Review results and feedback" },
];

const myLearningAction: DashboardAction = {
  to: ROUTES.STUDENT.MY_LEARNING,
  icon: "←",
  title: "My Learning",
  description: "Choose another active learning programme",
};

function todayIsoDate(): string {
  const today = new Date();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${today.getFullYear()}-${month}-${day}`;
}

function StudentDashboardPage() {
  const { currentUser } = useAuth();
  const { selectedEnrollment } = useEnrollment();
  const enrollmentId = (selectedEnrollment?.enrollmentId ?? selectedEnrollment?.id)!;
  const program = selectedEnrollment?.programType ?? selectedEnrollment?.batchType;
  const supportsExams = program !== "FLUENT";
  const programLabel = program === "MEMORIZATION"
    ? "Bhagavad Gita Memorization Program"
    : program === "REVISION"
      ? "Bhagavad Gita Revision Program"
      : "Bhagavad Gita Fluent Reading Program";
  const load = useCallback(() => studentService.getHome(enrollmentId), [enrollmentId]);
  const { data, error, loading, reload } = useStudentResource(load, "Failed to load learning progress.");
  const upcomingExam = data?.learningProgress.latestBooking?.date
    && data.learningProgress.latestBooking.date >= todayIsoDate()
    ? data.learningProgress.latestBooking
    : null;
  const upcomingExamDetails = data?.bookings.find((booking) => booking.id === upcomingExam?.bookingId);
  const latestResult = data?.learningProgress.latestGradedExam ?? null;
  const latestResultDetails = data?.bookings.find((booking) => booking.id === latestResult?.bookingId);
  const actions = supportsExams
    ? [...examActions, myLearningAction]
    : [...examActions.filter((action) => action.to === ROUTES.STUDENT.ATTENDANCE), myLearningAction];

  return (
    <div className="student-page dashboard-background dashboard-layout student-dashboard" style={dashboardBackgroundStyle}>
      <DashboardPageHeader
        title="Student Dashboard"
        invocation="శ్రీ కృష్ణాయ పరమాత్మనే నమః"
        subtitle={programLabel}
      >
        <div className="dashboard-heading__identity"><span>{currentUser?.name}</span><span>{currentUser?.volunteerId}</span></div>
      </DashboardPageHeader>

      <CurrentEnrollmentSummary />
      <section className="dashboard-quick-actions" aria-labelledby="student-quick-actions-title">
        <div className="dashboard-section-heading"><h2 id="student-quick-actions-title">Quick Actions</h2><p>Open the tools for your current learning workspace.</p></div>
        <DashboardActions actions={actions} ariaLabel="Student quick actions" />
      </section>
      {loading && <StudentState type="loading" message="Loading your learning workspace..." />}
      {!loading && error && <StudentState type="error" message={error} onRetry={() => void reload()} />}

      {!loading && data && (
        <>
          <section className="student-dashboard__overview student-journey__progress" aria-labelledby="student-overview-title">
            <div className="student-dashboard__section-heading">
              <div><h2 id="student-overview-title">Today&apos;s Progress</h2><p>Your learning journey at a glance.</p></div>
              {supportsExams && <strong>{data.learningProgress.overallProgressPercent}%</strong>}
            </div>
            {supportsExams && <div className="student-progress__bar" role="progressbar" aria-label="Overall learning progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={data.learningProgress.overallProgressPercent}><span style={{ width: `${data.learningProgress.overallProgressPercent}%` }} /></div>}
            <div className={`student-dashboard__stats${supportsExams ? "" : " student-dashboard__stats--fluent"}`}>
              {supportsExams && <><div><span>Completed Chapters</span><strong>{data.learningProgress.completedChapters}</strong><small>of {data.learningProgress.totalChapters}</small></div><div><span>Completed Slokas</span><strong>{data.learningProgress.completedSlokas}</strong><small>of {data.learningProgress.totalSlokas}</small></div><div><span>Remaining Slokas</span><strong>{data.learningProgress.remainingSlokas}</strong><small>continue your practice</small></div></>}
              <div><span>Attendance</span><strong>{data.learningProgress.attendance.percent}%</strong><small>{data.learningProgress.attendance.present} of {data.learningProgress.attendance.total} classes</small></div>
            </div>
          </section>

          <section className="student-journey__activity" aria-label="Upcoming learning activity">
            <StudentCard title={supportsExams ? "Upcoming Exam" : "Upcoming Class"}>
              {supportsExams ? (
                upcomingExam ? (
                  <dl className="student-learning-record">
                    <div><dt>Exam Date</dt><dd>{upcomingExamDetails?.formattedDate ?? upcomingExam.date}</dd></div>
                    <div><dt>Chapter</dt><dd>{upcomingExam.chapterName ?? `Chapter ${upcomingExam.chapterNumber ?? ""}`}</dd></div>
                    {upcomingExam.slokaCount && <div><dt>Slokas</dt><dd>1–{upcomingExam.slokaCount}</dd></div>}
                    {data.learningProgress.currentSyllabus.length > 0 && <div><dt>Study Next</dt><dd>{data.learningProgress.currentSyllabus[0].chapterName}</dd></div>}
                  </dl>
                ) : <StudentState type="empty" message="No exam booked yet. Use Book Slot when you are ready." />
              ) : (
                <div className="student-journey__guidance"><strong>Continue with your learning group</strong><p>Your next class follows your group&apos;s current learning schedule. Review attendance regularly and continue your reading practice.</p></div>
              )}
            </StudentCard>
          </section>

          {supportsExams && (
            <section className="student-journey__result" aria-label="Most recent examination result">
              <StudentCard title="Recent Result">
                {latestResult ? (
                  <dl className="student-learning-record student-learning-record--result">
                    <div><dt>Exam Date</dt><dd>{latestResultDetails?.formattedDate ?? latestResult.date}</dd></div>
                    {latestResultDetails?.assignedTeacherName && <div><dt>Teacher</dt><dd>{latestResultDetails.assignedTeacherName}</dd></div>}
                    <div><dt>Memorization</dt><dd>{latestResult.memorizationGrade}</dd></div>
                    <div><dt>Pronunciation</dt><dd>{latestResult.pronunciationGrade}</dd></div>
                    {latestResultDetails?.teacherComment && <div className="student-learning-record__comment"><dt>Teacher Comments</dt><dd>{latestResultDetails.teacherComment}</dd></div>}
                  </dl>
                ) : <StudentState type="empty" message="No final result yet. Results appear after both grades are submitted." />}
              </StudentCard>
            </section>
          )}
        </>
      )}

    </div>
  );
}

export default StudentDashboardPage;
