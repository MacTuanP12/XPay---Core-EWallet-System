package com.xpay.core.modules.transaction.dto.response;

import com.xpay.core.modules.transaction.entity.TransactionStatus;
import com.xpay.core.modules.transaction.entity.TransactionType;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class TransactionHistoryResponse {

    private String transactionId;
    private TransactionType type;        // DEPOSIT / TRANSFER (loại gốc)
    private String displayType;          // "DEPOSIT" | "RECEIVED" | "TRANSFER" — hiển thị FE
    private TransactionStatus status;
    private String amount;               // "500.000 VND"
    private String amountSigned;         // "+500.000 VND" hoặc "-500.000 VND"
    private String balanceAfter;         // Số dư ví sau giao dịch (để đối chiếu)
    private String counterpart;          // Tên user đối tác
    private String referenceNote;
    private String createdAt;
}
