package com.xpay.core.modules.transaction.controller;

import com.xpay.core.common.dto.ApiResponse;
import com.xpay.core.common.dto.PageResponse;
import com.xpay.core.modules.transaction.dto.response.TransactionHistoryResponse;
import com.xpay.core.modules.transaction.service.TransactionService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/transactions")
@RequiredArgsConstructor
public class TransactionController {

    private final TransactionService transactionService;

    @GetMapping("/my-history")
    public ResponseEntity<ApiResponse<PageResponse<TransactionHistoryResponse>>> getMyHistory(
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "10") int size
    ) {

        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        PageResponse<TransactionHistoryResponse> history = transactionService.getMyTransactionHistory(pageable);
        return ResponseEntity.ok(ApiResponse.success("Lấy lịch sử giao dịch thành công", history));
    }
}
