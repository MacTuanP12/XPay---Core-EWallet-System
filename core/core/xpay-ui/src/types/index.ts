
// ── Auth ────────────────────────────────────────────────────────────────────
export interface LoginRequest {
    username: string;
    password: string;
}

export interface AuthResponse {
    accessToken: string;
    tokenType: string;
    username: string;
    role: string;
}

// ── Common ───────────────────────────────────────────────────────────────────
export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
    timestamp: string;
}

export interface PageResponse<T> {
    content: T[];
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
    isLast: boolean;
}

export interface ErrorResponse {
    status: number;
    error: string;        // e.g. "INSUFFICIENT_BALANCE" | "INVALID_TRANSACTION"
    message: string;
    path: string;
    timestamp: string;
    validationErrors?: Record<string, string>;
}

// ── User ─────────────────────────────────────────────────────────────────────
export type KycStatus = 'UNVERIFIED' | 'VERIFIED' | 'REJECTED';

export interface UserProfile {
    username: string;
    email: string;
    kycStatus: KycStatus;
    createdAt: string;
}

// ── Wallet ───────────────────────────────────────────────────────────────────
export type WalletStatus = 'ACTIVE' | 'LOCKED';

export interface WalletResponse {
    walletId: string;
    balance: string;          // already formatted: "1.000.000 VND"
    currency: string;
    status: WalletStatus;
}

export interface DepositRequest {
    amount: number;
    referenceNote?: string;
}

export interface TransferRequest {
    receiverUsername: string;
    amount: number;
    message?: string;
}

export interface TransferResponse {
    transactionId: string;
    senderUsername: string;
    receiverUsername: string;
    amount: string;
    remainingBalance: string;
    message: string;
}

// ── Admin ─────────────────────────────────────────────────────────────────────
export interface AdminDashboardStats {
    totalUsers: number;
    totalWallets: number;
    totalSystemBalance: string;
    totalTransactions: number;
    todayTransactions: number;
    pendingKycCount: number;
    lockedWallets: number;
}

export interface AdminUser {
    userId: string;
    username: string;
    email: string;
    role: string;
    kycStatus: KycStatus;
    walletId: string;
    walletBalance: string;
    walletStatus: WalletStatus;
    createdAt: string;
}

export interface AdminTransaction {
    transactionId: string;
    type: TransactionType;
    status: TransactionStatus;
    amount: string;
    senderUsername: string;
    receiverUsername: string;
    referenceNote: string;
    createdAt: string;
}

export type TransactionType    = 'DEPOSIT' | 'TRANSFER' | 'WITHDRAW';
export type TransactionStatus  = 'SUCCESS' | 'FAILED'  | 'PENDING';
export type DisplayType        = 'DEPOSIT' | 'RECEIVED' | 'TRANSFER';

export interface Transaction {
    transactionId: string;
    type: TransactionType;
    displayType: DisplayType;       // DEPOSIT=nạp | RECEIVED=nhận | TRANSFER=chuyển đi
    status: TransactionStatus;
    amount: string;                 // "500.000 VND"
    amountSigned: string;           // "+500.000 VND" hoặc "−500.000 VND"
    balanceAfter: string;           // Số dư sau giao dịch (tham khảo)
    counterpart: string;            // username đối tác
    referenceNote: string;
    createdAt: string;
}

