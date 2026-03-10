package com.xpay.core.modules.admin.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AdminTransactionResponse {
    private String transactionId;
    private String type;
    private String status;
    private String amount;
    private String senderUsername;
    private String receiverUsername;
    private String referenceNote;
    private String createdAt;
}

