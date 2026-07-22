import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  signOut,
  sendPasswordResetEmail
} from "firebase/auth";
import { auth, googleProvider } from "../lib/firebase";
import api from "../lib/axios";
import { AuthResponse, LoginRequest, SignupRequest, ForgotPasswordRequest } from "../types/auth";

export const authService = {
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    await signInWithEmailAndPassword(auth, data.usernameOrEmail, data.password);
    const response = await api.get<AuthResponse>("/auth/me");
    return response.data;
  },

  signup: async (data: SignupRequest): Promise<AuthResponse> => {
    await createUserWithEmailAndPassword(auth, data.email, data.password);
    // Profile sync happens on backend /auth/me call
    const response = await api.get<AuthResponse>("/auth/me");
    return response.data;
  },

  forgotPassword: async (data: ForgotPasswordRequest): Promise<void> => {
    await sendPasswordResetEmail(auth, data.email);
  },

  googleLogin: async (): Promise<AuthResponse> => {
    await signInWithPopup(auth, googleProvider);
    const response = await api.get<AuthResponse>("/auth/me");
    return response.data;
  },

  logout: async (): Promise<void> => {
    await signOut(auth);
  }
};