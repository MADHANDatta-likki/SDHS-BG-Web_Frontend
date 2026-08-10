import type { LearningEnrollmentStatus } from "../../../types/Enrollment";

interface EnrollmentStatusBadgeProps {
  status: LearningEnrollmentStatus;
}

const STATUS_LABELS: Record<LearningEnrollmentStatus, string> = {
  PENDING: "Pending",
  ACTIVE: "Active",
  COMPLETED: "Completed",
  DROPPED: "Dropped",
  REJECTED: "Rejected",
};

function EnrollmentStatusBadge({ status }: EnrollmentStatusBadgeProps) {
  return (
    <span
      className={`enrollment-badge enrollment-status enrollment-status--${status.toLowerCase()}`}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}

export default EnrollmentStatusBadge;
