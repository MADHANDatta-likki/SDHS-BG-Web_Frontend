import { createContext } from "react";

import type { AuthenticatedUser } from "../types/AuthenticatedUser";
import type { JWTToken } from "../types/JWTToken";
import type { LoginRequest } from "../types/LoginRequest";
import type { Profile, UpdateProfileContactRequest } from "../../profile/types/Profile";

export interface AuthContextValue {
  login: (request: LoginRequest) => Promise<AuthenticatedUser>;
  logout: () => void;
  currentUser: AuthenticatedUser | null;
  token: JWTToken | null;
  isAuthenticated: boolean;
  loading: boolean;
  profile: Profile | null;
  refreshProfile: () => Promise<Profile>;
  updateProfileContact: (request: UpdateProfileContactRequest) => Promise<Profile>;
}

export const AuthContext = createContext<AuthContextValue | undefined>(
  undefined,
);
