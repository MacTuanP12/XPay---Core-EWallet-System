package com.xpay.core.modules.transaction.service;

import com.xpay.core.common.dto.PageResponse;
import com.xpay.core.exception.custom.ResourceNotFoundException;
import com.xpay.core.modules.identity.entity.User;
import com.xpay.core.modules.identity.repository.UserRepository;
import com.xpay.core.modules.transaction.dto.request.RecordTransactionRequest;
import com.xpay.core.modules.transaction.dto.response.TransactionHistoryResponse;
import com.xpay.core.modules.transaction.entity.Transaction;
import com.xpay.core.modules.transaction.entity.TransactionType;
import com.xpay.core.modules.transaction.repository.TransactionRepository;
import com.xpay.core.modules.wallet.entity.Wallet;
import com.xpay.core.modules.wallet.repository.WalletRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.text.DecimalFormat;
import java.text.DecimalFormatSymbols;
import java.time.format.DateTimeFormatter;
import java.util.Locale;

@Slf4j
@Service
@RequiredArgsConstructor
public class TransactionServiceImpl implements TransactionService {

    private final TransactionRepository transactionRepository;
    private final WalletRepository walletRepository;
    private final UserRepository userRepository;

    // REQUIRED: Tham gia transaction của WalletService đang gọi vào.
    // Nếu lưu lỗi → exception lan ngược lên → WalletService rollback cả cộng/trừ tiền.
    // → Đảm bảo "tiền đã trừ" và "lịch sử đã ghi" luôn đồng nhất, không bao giờ lệch nhau.
    @Transactional(propagation = Propagation.REQUIRED)
    @Override
    public Transaction record(RecordTransactionRequest request) {
        Transaction transaction = Transaction.builder()
                .sourceWallet(request.getSourceWallet())
                .destinationWallet(request.getDestinationWallet())
                .amount(request.getAmount())
                .type(request.getType())
                .status(request.getStatus())
                .referenceNote(request.getReferenceNote())
                .build();

        Transaction saved = transactionRepository.save(transaction);
        log.info("Đã ghi lịch sử [{}] thành công, txId: {}", request.getType(), saved.getId());
        return saved;
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<TransactionHistoryResponse> getMyTransactionHistory(Pageable pageable) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        log.info("Lấy lịch sử giao dịch cho username: {}, page: {}, size: {}",
                username, pageable.getPageNumber(), pageable.getPageSize());

        // 1. Tìm User → Wallet
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng: " + username));

        Wallet wallet = walletRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy ví của người dùng: " + username));

        // 2. Query có phân trang
        Page<Transaction> page = transactionRepository
                .findAllByWalletIdOrderByCreatedAtDesc(wallet.getId(), pageable);

        // 3. Map sang DTO
        DecimalFormatSymbols symbols = new DecimalFormatSymbols(Locale.getDefault());
        symbols.setGroupingSeparator('.');
        DecimalFormat formatter = new DecimalFormat("#,###", symbols);
        DateTimeFormatter dtf = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss");

        // 4. Đóng gói vào PageResponse — dùng static factory thay vì lặp builder
        return PageResponse.of(page.map(tx -> {
            String counterpart;
            if (tx.getType() == TransactionType.DEPOSIT) {
                counterpart = "Nạp từ bên ngoài";
            } else if (tx.getSourceWallet() != null
                    && tx.getSourceWallet().getId().equals(wallet.getId())) {
                counterpart = "→ Ví " + tx.getDestinationWallet().getId().toString().substring(0, 8) + "...";
            } else {
                counterpart = "← Ví " + tx.getSourceWallet().getId().toString().substring(0, 8) + "...";
            }

            return TransactionHistoryResponse.builder()
                    .transactionId(tx.getId().toString())
                    .type(tx.getType())
                    .status(tx.getStatus())
                    .amount(formatter.format(tx.getAmount()) + " " + wallet.getCurrency())
                    .counterpart(counterpart)
                    .referenceNote(tx.getReferenceNote())
                    .createdAt(tx.getCreatedAt().format(dtf))
                    .build();
        }));
    }
}

