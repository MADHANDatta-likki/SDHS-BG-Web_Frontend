import { useId } from "react";

interface AttendanceToggleProps {
  present: boolean;
  disabled: boolean;
  studentName: string;
  dateLabel: string;
  onChange: (present: boolean) => void;
}

function AttendanceToggle({
  present,
  disabled,
  studentName,
  dateLabel,
  onChange,
}: AttendanceToggleProps) {
  const groupName = useId();

  return (
    <fieldset
      className="teacher-attendance-toggle"
      disabled={disabled}
    >
      <legend className="teacher-visually-hidden">
        Attendance for {studentName} on {dateLabel}
      </legend>
      <label
        className={`teacher-attendance-toggle__option teacher-attendance-toggle__option--present${
          present ? " teacher-attendance-toggle__option--selected" : ""
        }`}
      >
        <input
          type="radio"
          name={groupName}
          value="present"
          checked={present}
          onChange={() => onChange(true)}
        />
        <span>Present</span>
      </label>
      <label
        className={`teacher-attendance-toggle__option teacher-attendance-toggle__option--absent${
          !present ? " teacher-attendance-toggle__option--selected" : ""
        }`}
      >
        <input
          type="radio"
          name={groupName}
          value="absent"
          checked={!present}
          onChange={() => onChange(false)}
        />
        <span>Absent</span>
      </label>
    </fieldset>
  );
}

export default AttendanceToggle;
