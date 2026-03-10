package com.xpay.core.modules.wallet.dto.response;

import com.xpay.core.modules.wallet.entity.WalletStatus;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class WalletResponse {

    private String walletId;
    private String balance;       // Định dạng sẵn: "1.000.000 VND"
    private String currency;
    private WalletStatus status;
}

