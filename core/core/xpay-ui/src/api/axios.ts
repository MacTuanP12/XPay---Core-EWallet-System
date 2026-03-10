import axios, { AxiosError } from 'axios';
import type {ApiResponse} from '../types';

const api = axios.create({
    baseURL: 'http://localhost:8080/api/v1',
    headers: {
        'Content-Type': 'application/json',
    },
});


api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});


api.interceptors.response.use(
    (response) => response,
    (error: AxiosError<ApiResponse<any>>) => {

        const backendMessage = error.response?.data?.message || "Lỗi hệ thống không xác định";


        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            window.location.href = '/login';
        }

        // Trường hợp 400: Lỗi nghiệp vụ (XP-2001, XP-2002...)

        console.error(`[API Error]: ${backendMessage}`);

        return Promise.reject(error);
    }
);

export default api;