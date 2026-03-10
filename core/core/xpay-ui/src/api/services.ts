import api from './axios';
import type { ApiResponse, Wallet, PageResponse, Transaction } from '../types';

export const walletService = {

    getMyWallet: () =>
        api.get<ApiResponse<Wallet>>('/wallets/my-wallet'),


    transfer: (data: { destinationWalletId: string; amount: number; referenceNote: string }) =>
        api.post<ApiResponse<any>>('/wallets/transfer', data),
};

export const transactionService = {

    getHistory: (page: number = 0, size: number = 10) =>
        api.get<ApiResponse<PageResponse<Transaction>>>(`/transactions/my-history?page=${page}&size=${size}`),
};