import { apiService } from "./api";

export interface User {
  id: string;
  email?: string;
  name?: string | null;
  surname?: string | null;
  rol?: string;
  status?: string;
  isEmailVerified?: boolean;
  authProvider?: string;
  googleId?: string | null;
  currentDeviceName?: string | null;
  lastLoginAt?: string | null;
  is_guest?: boolean;
  user_type?: "normal" | "guest";
  sessionId?: string;
  guestTokenId?: string;
  expiresAt?: string;
  avatar?: {
    url: string;
    key: string;
  } | null;
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

export interface GuestAccessResponse {
  token: string;
  expires_in: number;
}

export const authService = {
  async signIn(credentials: SignInRequest): Promise<SignInResponse> {
    return apiService.post<SignInResponse>("/auth/signin", credentials);
  },

  async createGuestAccess(): Promise<GuestAccessResponse> {
    return apiService.post<GuestAccessResponse>("/auth/guest");
  },

  async googleSignIn(idToken: string): Promise<SignInResponse> {
    return apiService.post<SignInResponse>("/auth/google", { idToken });
  },

  async logout(token: string): Promise<void> {
    return apiService.post<void>("/auth/logout", {}, token);
  },

  async getProfile(token: string): Promise<User> {
    return apiService.get<User>("/auth/profile", token);
  },

  async sendEmailVerificationOtp(
    token: string,
  ): Promise<{ ok: boolean; message?: string }> {
    return apiService.post<{ ok: boolean; message?: string }>(
      "/auth/verify/email",
      {},
      token,
    );
  },

  async forgotPassword(email: string): Promise<{ ok: boolean }> {
    return apiService.post<{ ok: boolean }>("/auth/forgot/password", { email });
  },

  async resetPasswordByToken(
    accessPassword: string,
    password: string,
  ): Promise<{ ok: boolean }> {
    return apiService.post<{ ok: boolean }>("/auth/update/password/by-token", {
      accessPassword,
      password,
    });
  },
};
