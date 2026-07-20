import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  signOut,
  sendPasswordResetEmail
} from "firebase/auth";
import { auth, googleProvider } from "../lib/firebase";
import api from "../lib/axios";

import {
    LoginRequest,
    SignupRequest,
    ForgotPasswordRequest,
    AuthResponse
}
    from "../types/auth";



export const authService = {



    login: async (
        data: LoginRequest
    ): Promise<AuthResponse> => {
        const userCredential = await signInWithEmailAndPassword(auth, data.email, data.password);
        const token = await userCredential.user.getIdToken();
        const response = await api.get<{ user: any }>("/auth/me");
        return {
            user: response.data.user,
            token: token
        };
    },



    signup: async (
        data: SignupRequest
    ): Promise<AuthResponse> => {
        const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
        const token = await userCredential.user.getIdToken();
        const response = await api.get<{ user: any }>("/auth/me");
        return {
            user: response.data.user,
            token: token
        };
    },



    forgotPassword:
        async (
            data: ForgotPasswordRequest
        ): Promise<void> => {
            await sendPasswordResetEmail(auth, data.email);
        },



    googleLogin:
        async (
            _token?: string
        ): Promise<AuthResponse> => {
            const userCredential = await signInWithPopup(auth, googleProvider);
            const token = await userCredential.user.getIdToken();
            const response = await api.get<{ user: any }>("/auth/me");
            return {
                user: response.data.user,
                token: token
            };
        },

    logout: async (): Promise<void> => {
        await signOut(auth);
    }



};