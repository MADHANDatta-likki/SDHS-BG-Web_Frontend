import RoleState from "../../../components/common/RoleState";

function AdminState({ type, message, onRetry }: {
  type: "loading" | "error" | "empty";
  message: string;
  onRetry?: () => void;
}) {
  return <RoleState type={type} message={message} onRetry={onRetry} stateClassName="admin-state" spinnerClassName="admin-spinner" buttonClassName="admin-button admin-button--secondary" />;
}
export default AdminState;
