package com.xpay.core.modules.admin.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AdminUserResponse {
    private String userId;
    private String username;
    private String email;
    private String role;
    private String kycStatus;
    private String walletId;
    private String walletBalance;
    private String walletStatus;
    private String createdAt;
}

