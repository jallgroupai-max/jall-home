import { apiService } from './api';

export interface Wallet {
    id: string;
    userId: string;
    balance: number;
    lastRecharge: string | null;
}

export const walletsService = {
    async getByUserId(userId: string, token: string): Promise<Wallet> {
        return apiService.get<Wallet>(`/wallets/${userId}`, token);
    },

    async create(userId: string, token: string): Promise<Wallet> {
        return apiService.post<Wallet>('/wallets', { userId }, token);
    },
};
