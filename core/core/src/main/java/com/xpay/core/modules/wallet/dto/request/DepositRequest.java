package com.xpay.core.modules.wallet.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class DepositRequest {

    @NotNull(message = "Số tiền không được để trống")
    @DecimalMin(value = "1000", message = "Số tiền nạp tối thiểu là 1.000 VND")
    private BigDecimal amount;

    private String referenceNote; // Ghi chú tuỳ chọn, ví dụ: "Nạp từ ngân hàng ABC"
}

