package com.xpay.core.modules.wallet.service;

import com.xpay.core.exception.custom.InsufficientBalanceException;
import com.xpay.core.exception.custom.InvalidTransactionException;
import com.xpay.core.exception.custom.ResourceNotFoundException;
import com.xpay.core.modules.identity.entity.User;
import com.xpay.core.modules.identity.repository.UserRepository;
import com.xpay.core.modules.wallet.dto.request.DepositRequest;
import com.xpay.core.modules.wallet.dto.request.TransferRequest;
import com.xpay.core.modules.transaction.dto.request.RecordTransactionRequest;
import com.xpay.core.modules.transaction.entity.Transaction;
import com.xpay.core.modules.transaction.entity.TransactionStatus;
import com.xpay.core.modules.transaction.entity.TransactionType;
import com.xpay.core.modules.transaction.service.TransactionService;
import com.xpay.core.modules.wallet.dto.response.TransferResponse;
import com.xpay.core.modules.wallet.dto.response.WalletResponse;
import com.xpay.core.modules.wallet.entity.Wallet;
import com.xpay.core.modules.wallet.repository.WalletRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.text.DecimalFormat;
import java.text.DecimalFormatSymbols;
import java.util.Locale;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class WalletServiceImpl implements WalletService {

    private final WalletRepository walletRepository;
    private final UserRepository userRepository;
    private final TransactionService transactionService; // Uỷ quyền ghi log cho Transaction module

    @Override
    public WalletResponse getMyWallet() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        log.info("Lấy thông tin ví cho username: {}", username);

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng: " + username));

        Wallet wallet = walletRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy ví cho người dùng: " + username));

        return toWalletResponse(wallet);
    }

    @Override
    @Transactional
    public WalletResponse deposit(DepositRequest request) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        log.info("Xử lý nạp tiền cho username: {}, số tiền: {}", username, request.getAmount());

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng: " + username));

        Wallet wallet = walletRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy ví cho người dùng: " + username));

        wallet.setBalance(wallet.getBalance().add(request.getAmount()));
        Wallet updatedWallet = walletRepository.save(wallet);
        log.info("Đã cộng {} vào ví ID: {}, số dư mới: {}", request.getAmount(), wallet.getId(), updatedWallet.getBalance());

        // Uỷ quyền cho TransactionService ghi nhật ký — Wallet không cần biết cách lưu
        transactionService.record(RecordTransactionRequest.builder()
                .sourceWallet(null)
                .destinationWallet(updatedWallet)
                .amount(request.getAmount())
                .type(TransactionType.DEPOSIT)
                .status(TransactionStatus.SUCCESS)
                .referenceNote(request.getReferenceNote())
                .build());

        return toWalletResponse(updatedWallet);
    }

    @Override
    @Transactional
    public TransferResponse transfer(TransferRequest request) {
        String senderUsername = SecurityContextHolder.getContext().getAuthentication().getName();
        log.info("Xử lý chuyển tiền từ [{}] → [{}], số tiền: {}", senderUsername, request.getReceiverUsername(), request.getAmount());

        // 1. Chặn chuyển tiền cho chính mình ngay từ đầu
        if (senderUsername.equals(request.getReceiverUsername())) {
            throw new InvalidTransactionException("Không thể chuyển tiền cho chính mình");
        }

        // 2. Tìm User người gửi và người nhận
        User sender = userRepository.findByUsername(senderUsername)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng: " + senderUsername));

        User receiver = userRepository.findByUsername(request.getReceiverUsername())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người nhận: " + request.getReceiverUsername()));

        // 3. Lấy cả 2 ví với Pessimistic Lock theo thứ tự ID cố định
        //    → Tránh Deadlock khi 2 thread cùng lock ngược nhau (A lock X rồi Y, B lock Y rồi X)
        UUID senderId = walletRepository.findByUserId(sender.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy ví người gửi")).getId();
        UUID receiverId = walletRepository.findByUserId(receiver.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy ví người nhận")).getId();

        // Lock theo thứ tự UUID tăng dần → luôn nhất quán dù ai gọi trước
        Wallet sourceWallet, destinationWallet;
        if (senderId.compareTo(receiverId) < 0) {
            sourceWallet      = walletRepository.findByIdWithLock(senderId).orElseThrow();
            destinationWallet = walletRepository.findByIdWithLock(receiverId).orElseThrow();
        } else {
            destinationWallet = walletRepository.findByIdWithLock(receiverId).orElseThrow();
            sourceWallet      = walletRepository.findByIdWithLock(senderId).orElseThrow();
        }

        // 4. Kiểm tra số dư
        if (sourceWallet.getBalance().compareTo(request.getAmount()) < 0) {
            throw new InsufficientBalanceException(
                    "Số dư không đủ. Hiện có: " + sourceWallet.getBalance() + " VND, cần: " + request.getAmount() + " VND"
            );
        }

        // 5. Trừ tiền người gửi, cộng tiền người nhận — trong cùng @Transactional
        sourceWallet.setBalance(sourceWallet.getBalance().subtract(request.getAmount()));
        destinationWallet.setBalance(destinationWallet.getBalance().add(request.getAmount()));

        walletRepository.save(sourceWallet);
        walletRepository.save(destinationWallet);
        log.info("Đã chuyển {} VND từ ví [{}] → [{}]", request.getAmount(), senderUsername, request.getReceiverUsername());

        // Uỷ quyền cho TransactionService ghi nhật ký
        Transaction savedTx = transactionService.record(RecordTransactionRequest.builder()
                .sourceWallet(sourceWallet)
                .destinationWallet(destinationWallet)
                .amount(request.getAmount())
                .type(TransactionType.TRANSFER)
                .status(TransactionStatus.SUCCESS)
                .referenceNote(request.getMessage())
                .build());

        // 7. Trả về TransferResponse với đầy đủ thông tin
        DecimalFormatSymbols symbols = new DecimalFormatSymbols(Locale.getDefault());
        symbols.setGroupingSeparator('.');
        DecimalFormat formatter = new DecimalFormat("#,###", symbols);

        return TransferResponse.builder()
                .transactionId(savedTx.getId().toString())
                .senderUsername(senderUsername)
                .receiverUsername(request.getReceiverUsername())
                .amount(formatter.format(request.getAmount()) + " " + sourceWallet.getCurrency())
                .remainingBalance(formatter.format(sourceWallet.getBalance()) + " " + sourceWallet.getCurrency())
                .message(request.getMessage())
                .build();
    }

    // Helper: Map Wallet Entity -> WalletResponse DTO
    private WalletResponse toWalletResponse(Wallet wallet) {
        DecimalFormatSymbols symbols = new DecimalFormatSymbols(Locale.getDefault());
        symbols.setGroupingSeparator('.');
        DecimalFormat formatter = new DecimalFormat("#,###", symbols);
        String formattedBalance = formatter.format(wallet.getBalance()) + " " + wallet.getCurrency();

        return WalletResponse.builder()
                .walletId(wallet.getId().toString())
                .balance(formattedBalance)
                .currency(wallet.getCurrency())
                .status(wallet.getStatus())
                .build();
    }
}

