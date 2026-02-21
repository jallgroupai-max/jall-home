import { apiService } from './api';

export interface Provider {
    id: string;
    logo: any;
    typeProvider: string;
    typeCost: string;
    cost: number;
    profitMargin: number;
    finalPrice: number;
    active: boolean;
}

export const providersService = {
    async getAll(token: string): Promise<Provider[]> {
        return apiService.get<Provider[]>('/providers/find/all', token);
    },

    async getById(id: string, token: string): Promise<Provider> {
        return apiService.get<Provider>(`/providers/${id}`, token);
    },
};
