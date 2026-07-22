export interface LoginRequest {
  usernameOrEmail: string;
  password: string;
}

export interface SignupRequest {
  username: string;
  email: string;
  password: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface AuthUser {
  id: string;
  username: string;
  email: string;
  rating?: number;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}