export type UserRole = 'admin' | 'citizen' | 'politician' | 'moderator' | null;

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}
