package com.xpay.core.modules.transaction.service;

import com.xpay.core.modules.transaction.dto.request.RecordTransactionRequest;
import com.xpay.core.modules.transaction.entity.Transaction;

public interface TransactionService {

    /**
     * Ghi nhật ký một giao dịch đã hoàn thành.
     * Được gọi bởi WalletService sau khi đã cộng/trừ tiền thành công.
     *
     * @return Transaction đã lưu (kèm ID để trả về cho client)
     */
    Transaction record(RecordTransactionRequest request);
}
