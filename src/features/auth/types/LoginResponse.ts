import type { AuthenticatedUser } from "./AuthenticatedUser";
import type { JWTToken } from "./JWTToken";

export interface LoginResponse extends AuthenticatedUser {
  token: JWTToken;
}
