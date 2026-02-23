import { apiService } from './api';

export interface User {
    id: string;
    email: string;
    name: string;
    surname: string;
    rol: string;
    status: string;
}

export interface SignInRequest {
    email: string;
    password: string;
}

export interface SignInResponse {
    ok: boolean;
    user?: User;
    access?: {
        accessToken: string;
        expiresAt: string;
    };
    message?: string; // Masked email when OTP is required
}

export const authService = {
    async signIn(credentials: SignInRequest): Promise<SignInResponse> {
        return apiService.post<SignInResponse>('/auth/signin', credentials);
    },

    async googleSignIn(idToken: string): Promise<SignInResponse> {
        return apiService.post<SignInResponse>('/auth/google', { idToken });
    },

    async logout(token: string): Promise<void> {
        return apiService.post<void>('/auth/logout', {}, token);
    },

    async getProfile(token: string): Promise<User> {
        return apiService.get<User>('/auth/profile', token);
    },
};
