export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  username?: string;
  rating?: number;
}


export interface LoginRequest {
  email: string;
  password: string;
}


export interface SignupRequest {
  name: string;
  email: string;
  password: string;
}


export interface AuthResponse {
  user: User;
  token: string;
}


export interface ForgotPasswordRequest {
  email: string;
}