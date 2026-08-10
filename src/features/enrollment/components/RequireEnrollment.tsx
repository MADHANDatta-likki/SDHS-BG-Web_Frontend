import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";

import { ROUTES } from "../../../constants/RouteConstants";
import { useOptionalEnrollment } from "../../../hooks/useEnrollment";
import StudentState from "../../student/components/StudentState";
import "../../student/styles/student.css";

interface RequireEnrollmentProps {
  children: ReactNode;
  requiresExam?: boolean;
}

function RequireEnrollment({ children, requiresExam = false }: RequireEnrollmentProps) {
  const enrollmentContext = useOptionalEnrollment();

  if (enrollmentContext === undefined) {
    return (
      <div className="student-page">
        <StudentState
          type="error"
          message="Enrollment selection is temporarily unavailable."
        />
      </div>
    );
  }

  if (enrollmentContext.validatingSelection) {
    return (
      <div className="student-page">
        <StudentState
          type="loading"
          message="Validating your learning enrollment..."
        />
      </div>
    );
  }

  if (enrollmentContext.selectionValidationError !== "") {
    return (
      <div className="student-page">
        <StudentState
          type="error"
          message={enrollmentContext.selectionValidationError}
          onRetry={enrollmentContext.retrySelectionValidation}
        />
      </div>
    );
  }

  if (enrollmentContext.selectedEnrollment === null) {
    return <Navigate to={ROUTES.STUDENT.MY_LEARNING} replace />;
  }

  const program = enrollmentContext.selectedEnrollment.programType
    ?? enrollmentContext.selectedEnrollment.batchType;
  if (requiresExam && program === "FLUENT") {
    return <Navigate to={ROUTES.DASHBOARD} replace />;
  }

  return children;
}

export default RequireEnrollment;
