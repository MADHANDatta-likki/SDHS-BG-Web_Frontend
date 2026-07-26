import axiosInstance from "../../../api/axios";
import { API_ENDPOINTS } from "../../../constants/ApiEndpoints";
import { AUTH_STORAGE_KEYS } from "../../../constants/AuthConstants";
import type { AuthenticatedUser } from "../types/AuthenticatedUser";
import type { ChangePasswordRequest } from "../types/ChangePasswordRequest";
import type { ChangePasswordResponse } from "../types/ChangePasswordResponse";
import type { JWTToken } from "../types/JWTToken";
import type { LoginRequest } from "../types/LoginRequest";
import type { LoginResponse } from "../types/LoginResponse";

function isAuthenticatedUser(value: unknown): value is AuthenticatedUser {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const user = value as Record<string, unknown>;

  return (
    typeof user.volunteerId === "string" &&
    typeof user.name === "string" &&
    typeof user.role === "string" &&
    typeof user.groupId === "string" &&
    typeof user.defaultPassword === "boolean"
  );
}

class AuthService {
  async login(request: LoginRequest): Promise<LoginResponse> {
    const response = await axiosInstance.post<LoginResponse>(
      API_ENDPOINTS.AUTH.LOGIN,
      request,
    );

    const currentUser: AuthenticatedUser = {
      volunteerId: response.data.volunteerId,
      name: response.data.name,
      role: response.data.role,
      groupId: response.data.groupId,
      defaultPassword: response.data.defaultPassword,
    };

    localStorage.setItem(AUTH_STORAGE_KEYS.TOKEN, response.data.token);
    localStorage.setItem(
      AUTH_STORAGE_KEYS.CURRENT_USER,
      JSON.stringify(currentUser),
    );

    return response.data;
  }

  async changePassword(
    request: ChangePasswordRequest,
  ): Promise<ChangePasswordResponse> {
    const response = await axiosInstance.post<ChangePasswordResponse>(
      API_ENDPOINTS.AUTH.CHANGE_PASSWORD,
      request,
    );

    return response.data;
  }

  logout(): void {
    localStorage.removeItem(AUTH_STORAGE_KEYS.TOKEN);
    localStorage.removeItem(AUTH_STORAGE_KEYS.CURRENT_USER);
  }

  refreshToken(): void {}

  getCurrentUser(): AuthenticatedUser | null {
    const storedUser = localStorage.getItem(AUTH_STORAGE_KEYS.CURRENT_USER);

    if (storedUser === null) {
      return null;
    }

    try {
      const parsedUser: unknown = JSON.parse(storedUser);
      return isAuthenticatedUser(parsedUser) ? parsedUser : null;
    } catch {
      return null;
    }
  }

  getToken(): JWTToken | null {
    return localStorage.getItem(AUTH_STORAGE_KEYS.TOKEN);
  }
}

const authService = new AuthService();

export default authService;
