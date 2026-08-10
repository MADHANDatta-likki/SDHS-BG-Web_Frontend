interface AttendanceDayHeaderProps {
  date: string;
  dateLabel: string;
  noClass: boolean;
  disabled: boolean;
  presentCount: number;
  absentCount: number;
  onNoClassChange: () => void;
  onMarkAllPresent: () => void;
  onMarkAllAbsent: () => void;
}

function formatHeaderDate(date: string): {
  weekday: string;
  monthAndDay: string;
} {
  const parsedDate = new Date(`${date}T00:00:00`);

  if (Number.isNaN(parsedDate.getTime())) {
    return { weekday: date, monthAndDay: "" };
  }

  return {
    weekday: new Intl.DateTimeFormat("en-US", { weekday: "long" }).format(
      parsedDate,
    ),
    monthAndDay: new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
    }).format(parsedDate),
  };
}

function AttendanceDayHeader({
  date,
  dateLabel,
  noClass,
  disabled,
  presentCount,
  absentCount,
  onNoClassChange,
  onMarkAllPresent,
  onMarkAllAbsent,
}: AttendanceDayHeaderProps) {
  const { weekday, monthAndDay } = formatHeaderDate(date);
  const bulkActionsDisabled = disabled || noClass;

  return (
    <div className="teacher-attendance-day">
      <div className="teacher-attendance-day__date">
        <strong>{weekday}</strong>
        {monthAndDay && <span>{monthAndDay}</span>}
      </div>
      <label className="teacher-no-class">
        <input
          type="checkbox"
          checked={noClass}
          disabled={disabled}
          onChange={onNoClassChange}
        />
        No Class
      </label>
      <div className="teacher-attendance-day__actions">
        <button
          className="teacher-button teacher-button--secondary teacher-attendance-day__present"
          type="button"
          disabled={bulkActionsDisabled}
          onClick={onMarkAllPresent}
          aria-label={`Mark all students present for ${dateLabel}`}
        >
          Mark All Present
        </button>
        <button
          className="teacher-button teacher-button--secondary teacher-attendance-day__absent"
          type="button"
          disabled={bulkActionsDisabled}
          onClick={onMarkAllAbsent}
          aria-label={`Mark all students absent for ${dateLabel}`}
        >
          Mark All Absent
        </button>
      </div>
      <div
        className="teacher-attendance-day__summary"
        aria-live="polite"
        aria-label={`${presentCount} present and ${absentCount} absent on ${dateLabel}`}
      >
        <span>Present: {presentCount}</span>
        <span>Absent: {absentCount}</span>
      </div>
    </div>
  );
}

export default AttendanceDayHeader;
