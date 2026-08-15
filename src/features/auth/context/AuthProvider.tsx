import { useCallback, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

import { AUTH_UNAUTHORIZED_EVENT } from "../../../constants/AuthConstants";
import authService from "../services/AuthService";
import type { AuthenticatedUser } from "../types/AuthenticatedUser";
import type { JWTToken } from "../types/JWTToken";
import type { LoginRequest } from "../types/LoginRequest";
import { AuthContext } from "./AuthContext";
import type { AuthContextValue } from "./AuthContext";
import profileService from "../../profile/services/ProfileService";
import type { Profile, UpdateProfileContactRequest } from "../../profile/types/Profile";

interface AuthProviderProps {
  children: ReactNode;
}

function AuthProvider({ children }: AuthProviderProps) {
  const [currentUser, setCurrentUser] = useState<AuthenticatedUser | null>(null);
  const [token, setToken] = useState<JWTToken | null>(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);

  const clearSession = useCallback(() => {
    setCurrentUser(null);
    setToken(null);
    setProfile(null);
  }, []);

  useEffect(() => {
    const storedUser = authService.getCurrentUser();
    const storedToken = authService.getToken();

    const restoreSession = async () => {
      if (storedUser !== null && storedToken !== null) {
        try {
          const storedProfile = await profileService.getProfile();
          setCurrentUser(storedUser);
          setToken(storedToken);
          setProfile(storedProfile);
        } catch {
          authService.logout();
          clearSession();
        }
      } else {
        authService.logout();
        clearSession();
      }
      setLoading(false);
    };

    void restoreSession();
  }, [clearSession]);

  useEffect(() => {
    window.addEventListener(AUTH_UNAUTHORIZED_EVENT, clearSession);

    return () => {
      window.removeEventListener(AUTH_UNAUTHORIZED_EVENT, clearSession);
    };
  }, [clearSession]);

  const login = useCallback(async (request: LoginRequest) => {
    try {
      const response = await authService.login(request);
      const authenticatedProfile = await profileService.getProfile();

      const authenticatedUser: AuthenticatedUser = {
        volunteerId: response.volunteerId,
        name: response.name,
        role: response.role,
        groupId: response.groupId,
        defaultPassword: response.defaultPassword,
      };

      setCurrentUser(authenticatedUser);
      setToken(response.token);
      setProfile(authenticatedProfile);
      return authenticatedUser;
    } catch (error: unknown) {
      authService.logout();
      clearSession();
      throw error;
    }
  }, [clearSession]);

  const refreshProfile = useCallback(async () => {
    const response = await profileService.getProfile();
    setProfile(response);
    return response;
  }, []);

  const updateProfileContact = useCallback(async (request: UpdateProfileContactRequest) => {
    const response = await profileService.updateContact(request);
    setProfile(response);
    return response;
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
      profile,
      refreshProfile,
      updateProfileContact,
    }),
    [currentUser, loading, login, logout, profile, refreshProfile, token, updateProfileContact],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthProvider;
