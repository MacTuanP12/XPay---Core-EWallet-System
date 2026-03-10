
export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
    timestamp: string;
}


export interface UserProfile {
    username: string;
    email: string;
    kycStatus: 'PENDING' | 'VERIFIED' | 'REJECTED';
}


export interface Wallet {
    id: string;
    balance: number;
    balanceFormatted: string;
    status: 'ACTIVE' | 'LOCKED';
}

export interface Transaction {
    transactionId: string;
    amount: number;
    type: 'DEPOSIT' | 'TRANSFER' | 'WITHDRAW';
    status: 'SUCCESS' | 'FAILED';
    description: string;
    createdAt: string;
}


export interface PageResponse<T> {
    content: T[];
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
    isLast: boolean;
}