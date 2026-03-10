package com.xpay.core.modules.identity.dto.response;

import com.xpay.core.modules.identity.entity.KycStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserProfileResponse {

    private String username;
    private String email;
    private KycStatus kycStatus;
    private String createdAt;
}
