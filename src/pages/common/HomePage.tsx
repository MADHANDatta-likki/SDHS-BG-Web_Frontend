import { Navigate } from "react-router-dom";

import { ROUTES } from "../../constants/RouteConstants";
import { useAuth } from "../../features/auth/hooks/useAuth";

function HomePage() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return null;
  }

  return (
    <Navigate
      to={isAuthenticated ? ROUTES.DASHBOARD : ROUTES.LOGIN}
      replace
    />
  );
}

export default HomePage;
