package com.xpay.core.modules.wallet.controller;

import com.xpay.core.common.dto.ApiResponse;
import com.xpay.core.modules.wallet.dto.request.DepositRequest;
import com.xpay.core.modules.wallet.dto.request.TransferRequest;
import com.xpay.core.modules.wallet.dto.response.TransferResponse;
import com.xpay.core.modules.wallet.dto.response.WalletResponse;
import com.xpay.core.modules.wallet.service.WalletService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/wallets")
@RequiredArgsConstructor
public class WalletController {

    private final WalletService walletService;

    @GetMapping("/my-wallet")
    public ResponseEntity<ApiResponse<WalletResponse>> getMyWallet() {
        WalletResponse wallet = walletService.getMyWallet();
        return ResponseEntity.ok(ApiResponse.success("Lấy thông tin ví thành công", wallet));
    }

    @PostMapping("/deposit")
    public ResponseEntity<ApiResponse<WalletResponse>> deposit(@Valid @RequestBody DepositRequest request) {
        WalletResponse wallet = walletService.deposit(request);
        return ResponseEntity.ok(ApiResponse.success("Nạp tiền thành công", wallet));
    }

    @PostMapping("/transfer")
    public ResponseEntity<ApiResponse<TransferResponse>> transfer(@Valid @RequestBody TransferRequest request) {
        TransferResponse result = walletService.transfer(request);
        return ResponseEntity.ok(ApiResponse.success("Chuyển tiền thành công", result));
    }
}
