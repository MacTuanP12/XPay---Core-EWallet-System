package com.xpay.core.modules.transaction.dto.response;

import com.xpay.core.modules.transaction.entity.TransactionStatus;
import com.xpay.core.modules.transaction.entity.TransactionType;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class TransactionHistoryResponse {

    private String transactionId;
    private TransactionType type;        // DEPOSIT / TRANSFER
    private TransactionStatus status;    // SUCCESS / FAILED / PENDING
    private String amount;               // Định dạng: "500.000 VND"
    private String counterpart;          // Tên ví/user đối diện (gửi đến ai / nhận từ ai)
    private String referenceNote;
    private String createdAt;            // Định dạng: "dd/MM/yyyy HH:mm:ss"
}
