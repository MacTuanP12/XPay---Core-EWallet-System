package com.xpay.core.modules.admin.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AdminDashboardStats {
    private long totalUsers;
    private long totalWallets;
    private String totalSystemBalance;   // tổng số dư toàn hệ thống
    private long totalTransactions;
    private long todayTransactions;
    private long pendingKycCount;        // user chờ duyệt KYC
    private long lockedWallets;
}

