import { Navigate } from "react-router-dom";
import { ROUTES } from "../../../constants/RouteConstants";
import { useAuth } from "../../auth/hooks/useAuth";

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { currentUser } = useAuth();
  return currentUser?.role === "ADMIN" ? children : <Navigate to={ROUTES.DASHBOARD} replace />;
}
export default AdminRoute;
