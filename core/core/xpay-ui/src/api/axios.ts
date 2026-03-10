import axios, { AxiosError } from 'axios';
import type { ApiResponse } from '../types';

const api = axios.create({
    baseURL: '/api/v1',
    headers: { 'Content-Type': 'application/json' },
});


api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});


api.interceptors.response.use(
    (response) => response,
    (error: AxiosError<ApiResponse<unknown>>) => {
        const status = error.response?.status;
        const backendMessage = error.response?.data?.message ?? 'Lỗi hệ thống không xác định';

        if (status === 401) {
            // Xoá storage + dispatch event để AuthContext lắng nghe → logout sạch React state
            localStorage.removeItem('token');
            localStorage.removeItem('username');
            localStorage.removeItem('role');
            window.dispatchEvent(new CustomEvent('auth:logout'));
        }

        if (status === 403) {
            console.warn('[API 403] Không có quyền truy cập:', error.config?.url);
        }

        console.error(`[API Error ${status}]: ${backendMessage}`);
        return Promise.reject(error);
    }
);

export default api;