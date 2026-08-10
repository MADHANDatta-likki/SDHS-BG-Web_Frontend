import { Navigate } from "react-router-dom";

import { ROUTES } from "../../../constants/RouteConstants";
import { useAuth } from "../../auth/hooks/useAuth";

function TeacherRoute({ children }: { children: React.ReactNode }) {
  const { currentUser } = useAuth();
  return currentUser?.role === "TEACHER" ? children : <Navigate to={ROUTES.DASHBOARD} replace />;
}

export default TeacherRoute;
