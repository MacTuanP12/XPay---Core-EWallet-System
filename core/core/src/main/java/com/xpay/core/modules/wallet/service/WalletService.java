package com.xpay.core.modules.wallet.service;

import com.xpay.core.modules.wallet.dto.request.DepositRequest;
import com.xpay.core.modules.wallet.dto.request.TransferRequest;
import com.xpay.core.modules.wallet.dto.response.TransferResponse;
import com.xpay.core.modules.wallet.dto.response.WalletResponse;

public interface WalletService {
    WalletResponse getMyWallet();
    WalletResponse deposit(DepositRequest request);
    TransferResponse transfer(TransferRequest request);
}
