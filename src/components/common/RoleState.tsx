interface RoleStateProps {
  type: "loading" | "error" | "empty";
  message: string;
  onRetry?: () => void;
  stateClassName: string;
  spinnerClassName: string;
  buttonClassName: string;
}

function RoleState({
  type,
  message,
  onRetry,
  stateClassName,
  spinnerClassName,
  buttonClassName,
}: RoleStateProps) {
  return (
    <div
      className={`${stateClassName} ${stateClassName}--${type}`}
      role={type === "error" ? "alert" : "status"}
      aria-live="polite"
      aria-busy={type === "loading"}
    >
      {type === "loading" && <span className={spinnerClassName} aria-hidden="true" />}
      <p>{message}</p>
      {type === "error" && onRetry && (
        <button className={buttonClassName} type="button" onClick={onRetry}>Try Again</button>
      )}
    </div>
  );
}

export default RoleState;
