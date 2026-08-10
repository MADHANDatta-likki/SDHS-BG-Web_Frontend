import RoleState from "../../../components/common/RoleState";

interface TeacherStateProps {
  type: "loading" | "error" | "empty";
  message: string;
  onRetry?: () => void;
}

function TeacherState({ type, message, onRetry }: TeacherStateProps) {
  return <RoleState type={type} message={message} onRetry={onRetry} stateClassName="teacher-state" spinnerClassName="teacher-spinner" buttonClassName="teacher-button teacher-button--secondary" />;
}

export default TeacherState;
