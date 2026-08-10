import RoleState from "../../../components/common/RoleState";

interface StudentStateProps {
  message: string;
  type: "loading" | "error" | "empty";
  onRetry?: () => void;
}

function StudentState({ message, type, onRetry }: StudentStateProps) {
  return <RoleState type={type} message={message} onRetry={onRetry} stateClassName="student-state" spinnerClassName="student-spinner" buttonClassName="student-button student-button--secondary" />;
}

export default StudentState;
