package com.xpay.core.modules.transaction.dto.request;

import com.xpay.core.modules.transaction.entity.TransactionType;
import com.xpay.core.modules.wallet.entity.Wallet;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

/**
 * DTO nội bộ: WalletService dùng để yêu cầu TransactionService ghi nhật ký.
 * Tách biệt hoàn toàn — WalletService không cần biết cách lưu Transaction.
 */
@Data
@Builder
public class RecordTransactionRequest {

    private Wallet sourceWallet;       // null nếu là DEPOSIT
    private Wallet destinationWallet;
    private BigDecimal amount;
    private TransactionType type;
    private String referenceNote;
}

