import { useState } from "react";
import { useNavigate } from "react-router-dom";

import DashboardPageHeader from "../../../components/common/DashboardPageHeader";
import { ROUTES } from "../../../constants/RouteConstants";
import "../../../theme/dashboard.css";
import type { ProgramType } from "../../../types/Enrollment";
import { dashboardBackgroundStyle } from "../../../utils/dashboardBackground";
import StudentState from "../../student/components/StudentState";
import { getStudentApiError } from "../../student/hooks/useStudentResource";
import enrollmentService from "../services/EnrollmentService";
import "../styles/enrollment.css";

const programs: ReadonlyArray<{ value: ProgramType; label: string }> = [
  { value: "FLUENT", label: "Fluent Reading" },
  { value: "MEMORIZATION", label: "Memorization" },
  { value: "REVISION", label: "Revision" },
];

function NewEnrollmentPage() {
  const navigate = useNavigate();
  const [programType, setProgramType] = useState<ProgramType | "">("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (programType === "") {
      return;
    }

    setSubmitting(true);
    setError("");
    try {
      await enrollmentService.createEnrollment({ programType });
      navigate(ROUTES.STUDENT.MY_LEARNING, { replace: true });
    } catch (requestError: unknown) {
      setError(
        getStudentApiError(
          requestError,
          "Unable to submit enrollment request.",
        ),
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="student-page enrollment-page dashboard-background dashboard-layout"
      style={dashboardBackgroundStyle}
    >
      <DashboardPageHeader
        title="New Enrollment"
        subtitle="Select the learning program you would like to request."
      />

      {error && <StudentState type="error" message={error} />}

      <section className="enrollment-request-card" aria-labelledby="programs-title">
        <form className="enrollment-request-form" onSubmit={submit}>
          <fieldset>
            <legend id="programs-title">Available Programs</legend>
            <div className="enrollment-program-options">
              {programs.map((program) => (
                <label key={program.value} className="enrollment-program-option">
                  <input
                    type="radio"
                    name="programType"
                    value={program.value}
                    checked={programType === program.value}
                    disabled={submitting}
                    onChange={() => setProgramType(program.value)}
                    required
                  />
                  <span>{program.label}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <div className="enrollment-request-form__actions">
            <button
              className="student-button student-button--secondary"
              type="button"
              disabled={submitting}
              onClick={() => navigate(ROUTES.STUDENT.MY_LEARNING)}
            >
              Cancel
            </button>
            <button
              className="student-button student-button--primary"
              type="submit"
              disabled={submitting || programType === ""}
            >
              {submitting && (
                <span
                  className="student-spinner student-spinner--small"
                  aria-hidden="true"
                />
              )}
              {submitting ? "Submitting..." : "Submit"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

export default NewEnrollmentPage;
