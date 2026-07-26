import { createContext } from "react";

import type { AuthenticatedUser } from "../types/AuthenticatedUser";
import type { JWTToken } from "../types/JWTToken";
import type { LoginRequest } from "../types/LoginRequest";

export interface AuthContextValue {
  login: (request: LoginRequest) => Promise<void>;
  logout: () => void;
  currentUser: AuthenticatedUser | null;
  token: JWTToken | null;
  isAuthenticated: boolean;
  loading: boolean;
}

export const AuthContext = createContext<AuthContextValue | undefined>(
  undefined,
);
