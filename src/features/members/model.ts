import type { Role } from "./permissions";

export interface Member {
  id: string;
  serviceId: string;
  userId: string;
  role: Role;
  createdAt: Date;
}

export interface MemberWithUser extends Member {
  userName: string | null;
  userEmail: string;
}
