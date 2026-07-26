export interface AuthenticatedUser {
  volunteerId: string;
  name: string;
  role: string;
  groupId: string;
  defaultPassword: boolean;
}
