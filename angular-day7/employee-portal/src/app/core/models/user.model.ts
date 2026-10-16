export interface UserProfile {
  id?: number;
  username: string;
  fullName: string;
  email: string;
  role: 'Admin' | 'Manager' | 'Employee';
  token?: string;
}

export interface AuthResponse {
  token: string;
  username: string;
  fullName: string;
  role: string;
  email: string;
  expiresAt: string;
}
