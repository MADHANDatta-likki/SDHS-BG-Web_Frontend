import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import DashboardPageHeader from "../../../components/common/DashboardPageHeader";
import { ROUTES } from "../../../constants/RouteConstants";
import { useOptionalEnrollment } from "../../../hooks/useEnrollment";
import "../../../theme/dashboard.css";
import type { LearningEnrollment } from "../../../types/Enrollment";
import { dashboardBackgroundStyle } from "../../../utils/dashboardBackground";
import StudentState from "../../student/components/StudentState";
import EnrollmentCard from "../components/EnrollmentCard";
import { useEnrollments } from "../hooks/useEnrollments";
import "../styles/enrollment.css";

const ENROLLMENT_GROUPS = [
  { status: "ACTIVE", title: "Active Learning" },
  { status: "PENDING", title: "Pending Approval" },
  { status: "COMPLETED", title: "Completed" },
  { status: "REJECTED", title: "Rejected" },
  { status: "DROPPED", title: "Dropped" },
] as const;

type EnrollmentGroupStatus = (typeof ENROLLMENT_GROUPS)[number]["status"];

function MyLearningPage() {
  const { enrollments, loading, error, refresh } = useEnrollments();
  const enrollmentContext = useOptionalEnrollment();
  const navigate = useNavigate();
  const [navigationError, setNavigationError] = useState("");
  const groupedEnrollments = useMemo(() => {
    const groups: Record<EnrollmentGroupStatus, LearningEnrollment[]> = {
      ACTIVE: [],
      PENDING: [],
      COMPLETED: [],
      REJECTED: [],
      DROPPED: [],
    };

    enrollments.forEach((enrollment) => {
      const status = enrollment.enrollmentStatus ?? enrollment.status;
      groups[status].push(enrollment);
    });

    return groups;
  }, [enrollments]);
  const hasCurrentEnrollment =
    groupedEnrollments.ACTIVE.length > 0 ||
    groupedEnrollments.PENDING.length > 0;

  const openEnrollmentRoute = (
    enrollment: LearningEnrollment,
    route: string,
  ) => {
    setNavigationError("");
    if (enrollmentContext === undefined) {
      setNavigationError(
        "Enrollment selection is temporarily unavailable. Please try again.",
      );
      return;
    }

    try {
      enrollmentContext.setSelectedEnrollment(enrollment);
      navigate(route);
    } catch {
      setNavigationError(
        "Unable to open the dashboard. Please try again.",
      );
    }
  };

  const openDashboard = (enrollment: LearningEnrollment) => {
    openEnrollmentRoute(enrollment, ROUTES.DASHBOARD);
  };

  const bookSlot = (enrollment: LearningEnrollment) => {
    openEnrollmentRoute(enrollment, ROUTES.STUDENT.SLOTS);
  };

  return (
    <div
      className="student-page enrollment-page student-learning-page dashboard-background dashboard-layout"
      style={dashboardBackgroundStyle}
    >
      <DashboardPageHeader
        title="My Learning"
        subtitle="Select a learning enrollment to open your dashboard."
        action={
          <button
            className="student-button student-button--secondary"
            type="button"
            onClick={() => navigate(ROUTES.STUDENT.NEW_ENROLLMENT)}
          >
            New Enrollment
          </button>
        }
      />

      {navigationError && (
        <StudentState type="error" message={navigationError} />
      )}

      {loading && (
        <StudentState type="loading" message="Loading learning enrollments..." />
      )}

      {!loading && error && (
        <StudentState
          type="error"
          message={error}
          onRetry={() => void refresh()}
        />
      )}

      {!loading && !error && enrollments.length === 0 && (
        <StudentState
          type="empty"
          message="You do not have a learning enrollment yet. Select New Enrollment to request a learning program."
        />
      )}

      {!loading && !error && enrollments.length > 0 && (
        <>
          {!hasCurrentEnrollment && (
            <StudentState
              type="empty"
              message="Your previous enrollments are shown below. Select New Enrollment to request another learning program."
            />
          )}
          {ENROLLMENT_GROUPS.map(({ status, title }) => {
            const matchingEnrollments = groupedEnrollments[status];

            if (matchingEnrollments.length === 0) {
              return null;
            }

            return (
              <section className="enrollment-section" key={status} aria-labelledby={`enrollment-${status.toLowerCase()}`}>
                <h2 id={`enrollment-${status.toLowerCase()}`}>{title}</h2>
                {status === "PENDING" && (
                  <p className="enrollment-section__guidance" role="status">
                    These requests are waiting for administrator approval.
                  </p>
                )}
                <div className="enrollment-grid">
                  {matchingEnrollments.map((enrollment) => (
                    <EnrollmentCard
                      key={enrollment.enrollmentId ?? enrollment.id}
                      enrollment={enrollment}
                      onBookSlot={bookSlot}
                      onOpenDashboard={openDashboard}
                    />
                  ))}
                </div>
              </section>
            );
          })}
        </>
      )}
    </div>
  );
}

export default MyLearningPage;
