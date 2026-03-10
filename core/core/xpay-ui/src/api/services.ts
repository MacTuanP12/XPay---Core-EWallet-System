import api from './axios';
import type {
    ApiResponse, AuthResponse, LoginRequest,
    WalletResponse, DepositRequest, TransferRequest, TransferResponse,
    PageResponse, Transaction, UserProfile,
    AdminDashboardStats, AdminUser, AdminTransaction,
} from '../types';



export const authService = {
    login: (data: LoginRequest) =>
        api.post<AuthResponse>('/auth/login', data),
    register: (data: { username: string; email: string; password: string }) =>
        api.post<{ message: string }>('/auth/register', data),
    forgotPassword: (email: string) =>
        api.post<{ message: string; resetToken: string }>('/auth/forgot-password', { email }),
    resetPassword: (data: { token: string; newPassword: string; confirmPassword: string }) =>
        api.post<{ message: string }>('/auth/reset-password', data),
    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        localStorage.removeItem('role');
    },
};

export const userService = {
    getProfile: () =>
        api.get<ApiResponse<UserProfile>>('/users/me'),
    changePassword: (data: { currentPassword: string; newPassword: string; confirmPassword: string }) =>
        api.post<{ message: string }>('/users/change-password', data),
};

export const walletService = {
    getMyWallet: () =>
        api.get<ApiResponse<WalletResponse>>('/wallets/my-wallet'),
    deposit: (data: DepositRequest) =>
        api.post<ApiResponse<WalletResponse>>('/wallets/deposit', data),
    transfer: (data: TransferRequest) =>
        api.post<ApiResponse<TransferResponse>>('/wallets/transfer', data),
};

export const transactionService = {
    getHistory: (page = 0, size = 10) =>
        api.get<ApiResponse<PageResponse<Transaction>>>(`/transactions/my-history?page=${page}&size=${size}`),
};

export const adminService = {
    getStats: () =>
        api.get<ApiResponse<AdminDashboardStats>>('/admin/stats'),
    getUsers: (page = 0, size = 10) =>
        api.get<ApiResponse<PageResponse<AdminUser>>>(`/admin/users?page=${page}&size=${size}`),
    approveKyc: (userId: string) =>
        api.patch<ApiResponse<AdminUser>>(`/admin/users/${userId}/kyc/approve`),
    rejectKyc: (userId: string) =>
        api.patch<ApiResponse<AdminUser>>(`/admin/users/${userId}/kyc/reject`),
    toggleWalletLock: (userId: string) =>
        api.patch<ApiResponse<AdminUser>>(`/admin/users/${userId}/wallet/toggle-lock`),
    getTransactions: (page = 0, size = 20) =>
        api.get<ApiResponse<PageResponse<AdminTransaction>>>(`/admin/transactions?page=${page}&size=${size}`),
};

