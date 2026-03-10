package com.xpay.core.modules.wallet.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class TransferRequest {

    @NotBlank(message = "Người nhận không được để trống")
    private String receiverUsername;

    @NotNull(message = "Số tiền không được để trống")
    @DecimalMin(value = "1000", message = "Số tiền chuyển tối thiểu là 1.000 VND")
    private BigDecimal amount;

    private String message; // Lời nhắn chuyển tiền
}
