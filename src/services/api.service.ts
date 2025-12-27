import axios, { AxiosInstance, AxiosError } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

class ApiService {
    private api: AxiosInstance;

    constructor() {
        this.api = axios.create({
            baseURL: API_BASE_URL,
            headers: {
                'Content-Type': 'application/json',
            },
        });

        // Request interceptor to add auth token
        this.api.interceptors.request.use(
            (config) => {
                const token = localStorage.getItem('auth_token');
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
                return config;
            },
            (error) => Promise.reject(error)
        );

        // Response interceptor to handle errors
        this.api.interceptors.response.use(
            (response) => response,
            (error: AxiosError) => {
                if (error.response?.status === 401) {
                    // Token expired or invalid
                    localStorage.removeItem('auth_token');
                    localStorage.removeItem('user_data');
                    window.location.href = '/';
                }
                return Promise.reject(error);
            }
        );
    }

    // Auth endpoints
    async register(email: string, password: string, name: string) {
        const response = await this.api.post('/auth/register', { email, password, name });
        return response.data;
    }

    async login(email: string, password: string) {
        const response = await this.api.post('/auth/login', { email, password });
        return response.data;
    }

    async getCurrentUser() {
        const response = await this.api.get('/auth/me');
        return response.data;
    }

    // Sales endpoints
    async getSales(filters?: {
        clientName?: string;
        startDate?: string;
        endDate?: string;
        status?: string;
    }) {
        const response = await this.api.get('/sales', { params: filters });
        return response.data;
    }

    async createSale(sale: {
        clientName: string;
        itemSold: string;
        value: number;
        date: string;
        status?: string;
    }) {
        const response = await this.api.post('/sales', sale);
        return response.data;
    }

    async updateSaleStatus(id: string, status: 'pending' | 'paid') {
        const response = await this.api.patch(`/sales/${id}/status`, { status });
        return response.data;
    }

    async deleteSale(id: string) {
        const response = await this.api.delete(`/sales/${id}`);
        return response.data;
    }

    async exportSalesCSV() {
        const response = await this.api.get('/sales/export/csv', {
            responseType: 'blob',
        });
        return response.data;
    }

    async exportSalesJSON() {
        const response = await this.api.get('/sales/export/json');
        return response.data;
    }

    // Clients endpoints
    async getClients() {
        const response = await this.api.get('/clients');
        return response.data;
    }

    async getClientSales(clientName: string) {
        const response = await this.api.get(`/clients/${encodeURIComponent(clientName)}/sales`);
        return response.data;
    }

    // Insights endpoints
    async generateInsights() {
        const response = await this.api.post('/insights/generate');
        return response.data;
    }
}

export const apiService = new ApiService();
