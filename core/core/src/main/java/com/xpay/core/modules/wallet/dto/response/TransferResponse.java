package com.xpay.core.modules.wallet.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class TransferResponse {

    private String transactionId;   // Mã giao dịch để tra cứu sau
    private String senderUsername;
    private String receiverUsername;
    private String amount;          // Định dạng sẵn: "500.000 VND"
    private String remainingBalance; // Số dư còn lại sau khi chuyển
    private String message;         // Lời nhắn
}

