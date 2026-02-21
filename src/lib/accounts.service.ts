import { apiService } from './api';

export interface Account {
    id: string;
    providerId: string;
    supportedUsers: number;
    email: string;
    password?: string;
    token?: string;
    available: boolean;
    active: boolean;
    provider?: any;
}

export interface UserAccount {
    id: string;
    userId: string;
    accountId: string;
    providerId: string;
    lastAccessAt?: Date;
    expiresAt?: Date;
    active: boolean;
    accessToken?: string;
    account?: Account;
}

export interface AssignAccountRequest {
    userId: string;
    providerId: string;
    expiresAt?: Date;
}

export interface ValidateAccessRequest {
    userId: string;
    accountId: string;
}

export interface ValidateAccessResponse {
    hasAccess: boolean;
    hasBalance: boolean;
    message: string;
    userAccount?: UserAccount;
}

export interface GenerateTokenRequest {
    userId: string;
    accountId: string;
}

export interface GenerateTokenResponse {
    token: string;
    account: Account;
}

export const accountsService = {
    /**
     * Asigna una cuenta GPT a un usuario (contratar)
     */
    async assignAccount(data: AssignAccountRequest, token: string): Promise<UserAccount> {
        return apiService.post<UserAccount>('/user-accounts/assign', data, token);
    },

    /**
     * Valida si el usuario tiene acceso y saldo
     */
    async validateAccess(data: ValidateAccessRequest, token: string): Promise<ValidateAccessResponse> {
        return apiService.post<ValidateAccessResponse>('/user-accounts/validate-access', data, token);
    },

    /**
     * Genera un token de acceso para la cuenta GPT
     */
    async generateToken(data: GenerateTokenRequest, token: string): Promise<GenerateTokenResponse> {
        return apiService.post<GenerateTokenResponse>('/user-accounts/generate-token', data, token);
    },

    /**
     * Obtiene las cuentas disponibles de un proveedor
     */
    async getAvailableAccounts(providerId: string, token: string): Promise<Account[]> {
        return apiService.get<Account[]>(`/user-accounts/available?providerId=${providerId}`, token);
    },

    /**
     * Obtiene las cuentas del usuario autenticado
     */
    async getMyAccounts(token: string): Promise<UserAccount[]> {
        return apiService.get<UserAccount[]>('/user-accounts/my-accounts', token);
    },

    /**
     * Desactiva una cuenta asignada
     */
    async deactivateAccount(userId: string, accountId: string, token: string): Promise<{ message: string }> {
        return apiService.delete<{ message: string }>(`/user-accounts/${userId}/${accountId}`, token);
    },
};
