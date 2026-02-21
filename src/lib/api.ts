const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

interface RequestOptions extends RequestInit {
    token?: string;
}

class ApiService {
    private baseURL: string;

    constructor(baseURL: string) {
        this.baseURL = baseURL;
    }

    private getHeaders(token?: string, isFormData: boolean = false): HeadersInit {
        const headers: HeadersInit = {};

        if (!isFormData) {
            headers['Content-Type'] = 'application/json';
        }

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        return headers;
    }

    async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
        const { token, ...fetchOptions } = options;
        const isFormData = fetchOptions.body instanceof FormData;

        const config: RequestInit = {
            ...fetchOptions,
            headers: {
                ...this.getHeaders(token, isFormData),
                ...fetchOptions.headers,
            },
        };

        const response = await fetch(`${this.baseURL}${endpoint}`, config);

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.message || `HTTP Error: ${response.status}`);
        }

        return response.json();
    }

    async get<T>(endpoint: string, token?: string): Promise<T> {
        return this.request<T>(endpoint, { method: 'GET', token });
    }

    async post<T>(endpoint: string, data?: any, token?: string): Promise<T> {
        return this.request<T>(endpoint, {
            method: 'POST',
            body: JSON.stringify(data),
            token,
        });
    }

    async put<T>(endpoint: string, data?: any, token?: string): Promise<T> {
        return this.request<T>(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data),
            token,
        });
    }

    async patch<T>(endpoint: string, data?: any, token?: string): Promise<T> {
        return this.request<T>(endpoint, {
            method: 'PATCH',
            body: JSON.stringify(data),
            token,
        });
    }

    async delete<T>(endpoint: string, token?: string): Promise<T> {
        return this.request<T>(endpoint, { method: 'DELETE', token });
    }

    async upload<T>(endpoint: string, file: File, token?: string): Promise<T> {
        const formData = new FormData();
        formData.append('file', file);
        return this.request<T>(endpoint, {
            method: 'POST',
            body: formData,
            token,
        });
    }
}

export const apiService = new ApiService(API_BASE_URL);
