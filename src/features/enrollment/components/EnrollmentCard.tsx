import type { LearningEnrollment } from "../../../types/Enrollment";
import EnrollmentStatusBadge from "./EnrollmentStatusBadge";
import ProgramBadge from "./ProgramBadge";

interface EnrollmentCardProps {
  enrollment: LearningEnrollment;
  onBookSlot: (enrollment: LearningEnrollment) => void;
  onOpenDashboard: (enrollment: LearningEnrollment) => void;
}

interface TimelineStep {
  label: string;
  date: string | null;
  dateTime?: string | null;
  current?: boolean;
}

function formatEnrollmentDate(value?: string | null): string | null {
  if (!value) {
    return null;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function buildTimelineSteps(
  status: LearningEnrollment["status"],
  enrollmentDate: string | null,
  enrollmentDateTime?: string | null,
  completionDate?: string | null,
  completionDateTime?: string | null,
  decisionDate?: string | null,
  decisionDateTime?: string | null,
): TimelineStep[] {
  const terminalStep =
    status === "COMPLETED"
      ? { label: "Completed", date: completionDate ?? null, dateTime: completionDateTime }
      : status === "REJECTED"
        ? { label: "Rejected", date: decisionDate ?? null, dateTime: decisionDateTime }
        : status === "DROPPED"
          ? { label: "Dropped", date: decisionDate ?? null, dateTime: decisionDateTime }
          : status === "ACTIVE"
            ? { label: "Active", date: null }
            : { label: "Pending Approval", date: null };

  return [
    { label: "Created", date: enrollmentDate, dateTime: enrollmentDateTime },
    { ...terminalStep, current: true },
  ];
}

function EnrollmentCard({
  enrollment,
  onBookSlot,
  onOpenDashboard,
}: EnrollmentCardProps) {
  const program = enrollment.programType ?? enrollment.batchType;
  const supportsExams = program !== "FLUENT";
  const status = enrollment.enrollmentStatus ?? enrollment.status;
  const isDefault = enrollment.isDefault ?? enrollment.defaultEnrollment;
  const group = enrollment.groupName?.trim() || enrollment.groupId?.trim();
  const center = enrollment.centerName?.trim();
  const teacher = enrollment.teacherName?.trim();
  const enrollmentDate = formatEnrollmentDate(enrollment.enrollmentDate);
  const completionDate = formatEnrollmentDate(enrollment.completionDate);
  const decisionDate = formatEnrollmentDate(enrollment.decisionDate);

  const timelineSteps = buildTimelineSteps(
    status,
    enrollmentDate,
    enrollment.enrollmentDate,
    completionDate,
    enrollment.completionDate,
    decisionDate,
    enrollment.decisionDate,
  );

  return (
    <article className="enrollment-card">
      <header className="enrollment-card__header">
        <ProgramBadge program={program} />
        <EnrollmentStatusBadge status={status} />
      </header>

      <dl className="enrollment-card__details">
        {teacher && <div><dt>Teacher</dt><dd>{teacher}</dd></div>}
        {group && <div><dt>Group</dt><dd>{group}</dd></div>}
        {center && <div><dt>Center</dt><dd>{center}</dd></div>}
        {enrollmentDate && (
          <div><dt>Enrollment Date</dt><dd><time dateTime={enrollment.enrollmentDate ?? undefined}>{enrollmentDate}</time></dd></div>
        )}
        {completionDate && (
          <div><dt>Completion Date</dt><dd><time dateTime={enrollment.completionDate ?? undefined}>{completionDate}</time></dd></div>
        )}
        {decisionDate && (status === "REJECTED" || status === "DROPPED") && (
          <div><dt>Decision Date</dt><dd><time dateTime={enrollment.decisionDate ?? undefined}>{decisionDate}</time></dd></div>
        )}
      </dl>

      <ol className="enrollment-timeline" aria-label="Enrollment timeline">
        {timelineSteps.map((step) => (
          <li
            className={`enrollment-timeline__step${step.current ? " enrollment-timeline__step--current" : ""}`}
            key={step.label}
          >
            <span>{step.label}</span>
            {step.date && (
              <time dateTime={step.dateTime ?? undefined}>{step.date}</time>
            )}
          </li>
        ))}
      </ol>

      {status === "REJECTED" && (
        <p className="enrollment-card__decision-note">
          No additional comments were recorded for this rejection.
        </p>
      )}

      <footer className="enrollment-card__indicators">
        <span
          className={
            isDefault
              ? "enrollment-indicator enrollment-indicator--default"
              : "enrollment-indicator"
          }
        >
          {isDefault ? "Default Enrollment" : "Additional Enrollment"}
        </span>
        <span
          className={
            enrollment.slotEligible
              ? "enrollment-indicator enrollment-indicator--eligible"
              : "enrollment-indicator"
          }
        >
          {enrollment.slotEligible ? "Slot Eligible" : "Slot Not Eligible"}
        </span>
      </footer>
      <div className="enrollment-card__action">
        {status === "ACTIVE" ? (
          <>
            {supportsExams && (
              <button
                className="student-button student-button--secondary"
                type="button"
                onClick={() => onBookSlot(enrollment)}
              >
                Book Slot
              </button>
            )}
            <button
              className="student-button student-button--primary"
              type="button"
              onClick={() => onOpenDashboard(enrollment)}
            >
              Open Dashboard
            </button>
          </>
        ) : status === "PENDING" ? (
          <p className="enrollment-card__pending" role="status">
            Waiting for Admin Approval
          </p>
        ) : null}
      </div>
    </article>
  );
}

export default EnrollmentCard;
