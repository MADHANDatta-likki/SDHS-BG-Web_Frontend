interface StudentStateProps {
  message: string;
  type: "loading" | "error" | "empty";
  onRetry?: () => void;
}

function StudentState({ message, type, onRetry }: StudentStateProps) {
  return (
    <div
      className={`student-state student-state--${type}`}
      role={type === "error" ? "alert" : "status"}
      aria-live="polite"
    >
      {type === "loading" && <span className="student-spinner" aria-hidden="true" />}
      <p>{message}</p>
      {type === "error" && onRetry && (
        <button className="student-button student-button--secondary" type="button" onClick={onRetry}>
          Try Again
        </button>
      )}
    </div>
  );
}

export default StudentState;
