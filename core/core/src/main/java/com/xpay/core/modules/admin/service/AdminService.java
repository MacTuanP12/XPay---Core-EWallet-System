package com.xpay.core.modules.admin.service;

import com.xpay.core.common.dto.PageResponse;
import com.xpay.core.modules.admin.dto.response.AdminDashboardStats;
import com.xpay.core.modules.admin.dto.response.AdminTransactionResponse;
import com.xpay.core.modules.admin.dto.response.AdminUserResponse;
import org.springframework.data.domain.Pageable;

public interface AdminService {

    AdminDashboardStats getDashboardStats();

    PageResponse<AdminUserResponse> getAllUsers(Pageable pageable);

    AdminUserResponse approveKyc(String userId);

    AdminUserResponse rejectKyc(String userId);

    AdminUserResponse toggleWalletLock(String userId);

    PageResponse<AdminTransactionResponse> getAllTransactions(Pageable pageable);
}

