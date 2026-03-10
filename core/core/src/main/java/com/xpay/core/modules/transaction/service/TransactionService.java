package com.xpay.core.modules.transaction.service;

import com.xpay.core.common.dto.PageResponse;
import com.xpay.core.modules.transaction.dto.request.RecordTransactionRequest;
import com.xpay.core.modules.transaction.dto.response.TransactionHistoryResponse;
import com.xpay.core.modules.transaction.entity.Transaction;
import org.springframework.data.domain.Pageable;

public interface TransactionService {

    /**
     * Ghi nhật ký một giao dịch đã hoàn thành.
     * Được gọi bởi WalletService sau khi đã cộng/trừ tiền thành công.
     */
    Transaction record(RecordTransactionRequest request);

    /**
     * Lấy lịch sử giao dịch của ví thuộc về user đang đăng nhập, có phân trang.
     */
    PageResponse<TransactionHistoryResponse> getMyTransactionHistory(Pageable pageable);
}
