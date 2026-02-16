
import { apiService } from "./api";

export interface PaymentMethod {
    id: string;
    typeMethod: string;
    name: string;
    description: string;
    active: boolean;
}

export interface Payment {
    id: string;
    total: number;
    amount: number;
    amountBs?: number;
    status: 'pending' | 'accepted' | 'rejected';
    created_at: string;
    paymentMethod: PaymentMethod;
    typePayment: string;
    note?: string;
    receiptFile?: {
        name: string;
        key: string;
        url: string; 
    };
    exchangeRate?: {
        rate: number;
        currency: string;
        timestamp: string;
    };
}

export interface PaginatedResult<T> {
    data: T[];
    meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

export interface FilterPaymentDto {
    page?: number;
    limit?: number;
    status?: 'pending' | 'accepted' | 'rejected';
    startDate?: string;
    endDate?: string;
}

class PaymentsService {
    async getByUser(userId: string, token: string, filter?: FilterPaymentDto): Promise<PaginatedResult<Payment>> {
        // Build query string from filter
        const params = new URLSearchParams();
        if (filter?.page) params.append('page', filter.page.toString());
        if (filter?.limit) params.append('limit', filter.limit.toString());
        if (filter?.status) params.append('status', filter.status);
        if (filter?.startDate) params.append('startDate', filter.startDate);
        if (filter?.endDate) params.append('endDate', filter.endDate);

        const queryString = params.toString() ? `?${params.toString()}` : '';

        return await apiService.get<PaginatedResult<Payment>>(`/payments/user/${userId}${queryString}`, token);
    }
    
    async getPendingCount(userId: string, token: string): Promise<number> {
        const result = await this.getByUser(userId, token, { status: 'pending', limit: 1 });
        return result.meta.total;
    }
}

export const paymentsService = new PaymentsService();
