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
    ) => {

        const response =
            await api.post<AuthResponse>(
                "/auth/login",
                data
            );

        return response.data;

    },



    signup: async (
        data: SignupRequest
    ) => {

        const response =
            await api.post<AuthResponse>(
                "/auth/signup",
                data
            );

        return response.data;

    },



    forgotPassword:
        async (
            data: ForgotPasswordRequest
        ) => {

            const response =
                await api.post(
                    "/auth/forgot-password",
                    data
                );


            return response.data;

        },



    googleLogin:
        async (
            token: string
        ) => {

            const response =
                await api.post<AuthResponse>(
                    "/auth/google",
                    {
                        token
                    }
                );


            return response.data;

        }



};