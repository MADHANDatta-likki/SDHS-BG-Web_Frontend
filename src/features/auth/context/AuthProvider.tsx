import { useCallback, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

import { AUTH_UNAUTHORIZED_EVENT } from "../../../constants/AuthConstants";
import authService from "../services/AuthService";
import type { AuthenticatedUser } from "../types/AuthenticatedUser";
import type { JWTToken } from "../types/JWTToken";
import type { LoginRequest } from "../types/LoginRequest";
import { AuthContext } from "./AuthContext";
import type { AuthContextValue } from "./AuthContext";

interface AuthProviderProps {
  children: ReactNode;
}

function AuthProvider({ children }: AuthProviderProps) {
  const [currentUser, setCurrentUser] = useState<AuthenticatedUser | null>(null);
  const [token, setToken] = useState<JWTToken | null>(null);
  const [loading, setLoading] = useState(true);

  const clearSession = useCallback(() => {
    setCurrentUser(null);
    setToken(null);
  }, []);

  useEffect(() => {
    const storedUser = authService.getCurrentUser();
    const storedToken = authService.getToken();

    if (storedUser !== null && storedToken !== null) {
      setCurrentUser(storedUser);
      setToken(storedToken);
    } else {
      authService.logout();
      clearSession();
    }

    setLoading(false);
  }, [clearSession]);

  useEffect(() => {
    window.addEventListener(AUTH_UNAUTHORIZED_EVENT, clearSession);

    return () => {
      window.removeEventListener(AUTH_UNAUTHORIZED_EVENT, clearSession);
    };
  }, [clearSession]);

  const login = useCallback(async (request: LoginRequest) => {
    const response = await authService.login(request);

    const authenticatedUser: AuthenticatedUser = {
      volunteerId: response.volunteerId,
      name: response.name,
      role: response.role,
      groupId: response.groupId,
      defaultPassword: response.defaultPassword,
    };

    setCurrentUser(authenticatedUser);
    setToken(response.token);
    return authenticatedUser;
  }, []);

  const logout = useCallback(() => {
    authService.logout();
    clearSession();
  }, [clearSession]);

  const value = useMemo<AuthContextValue>(
    () => ({
      login,
      logout,
      currentUser,
      token,
      isAuthenticated: currentUser !== null && token !== null,
      loading,
    }),
    [currentUser, loading, login, logout, token],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthProvider;
