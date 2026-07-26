import { Navigate } from "react-router-dom";

import { ROUTES } from "../../../constants/RouteConstants";
import { useAuth } from "../../auth/hooks/useAuth";

interface StudentRouteProps {
  children: React.ReactNode;
}

function StudentRoute({ children }: StudentRouteProps) {
  const { currentUser } = useAuth();
  return currentUser?.role === "STUDENT" ? children : <Navigate to={ROUTES.DASHBOARD} replace />;
}

export default StudentRoute;
