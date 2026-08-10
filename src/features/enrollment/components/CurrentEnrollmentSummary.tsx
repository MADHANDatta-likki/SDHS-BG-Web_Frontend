import { useEnrollment } from "../../../hooks/useEnrollment";
import ProgramBadge from "./ProgramBadge";
import "../styles/enrollment.css";

function CurrentEnrollmentSummary() {
  const { selectedEnrollment } = useEnrollment();

  if (selectedEnrollment === null) {
    return null;
  }

  const program =
    selectedEnrollment.programType ?? selectedEnrollment.batchType;
  const group =
    selectedEnrollment.groupName?.trim() || selectedEnrollment.groupId?.trim();
  const teacher = selectedEnrollment.teacherName?.trim();
  const center = selectedEnrollment.centerName?.trim();

  return (
    <section
      className="current-enrollment"
      aria-labelledby="current-enrollment-title"
    >
      <div className="current-enrollment__heading">
        <h2 id="current-enrollment-title">Current Learning</h2>
        <ProgramBadge program={program} />
      </div>
      {(group || teacher || center) && (
        <dl className="current-enrollment__details">
          {group && (
            <div>
              <dt>Group</dt>
              <dd>{group}</dd>
            </div>
          )}
          {teacher && (
            <div>
              <dt>Teacher</dt>
              <dd>{teacher}</dd>
            </div>
          )}
          {center && (
            <div>
              <dt>Center</dt>
              <dd>{center}</dd>
            </div>
          )}
        </dl>
      )}
    </section>
  );
}

export default CurrentEnrollmentSummary;
