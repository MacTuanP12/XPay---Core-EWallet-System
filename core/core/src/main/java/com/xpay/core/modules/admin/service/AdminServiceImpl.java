package com.xpay.core.modules.admin.service;

import com.xpay.core.common.dto.PageResponse;
import com.xpay.core.exception.custom.ResourceNotFoundException;
import com.xpay.core.modules.admin.dto.response.AdminDashboardStats;
import com.xpay.core.modules.admin.dto.response.AdminTransactionResponse;
import com.xpay.core.modules.admin.dto.response.AdminUserResponse;
import com.xpay.core.modules.identity.entity.KycStatus;
import com.xpay.core.modules.identity.entity.User;
import com.xpay.core.modules.identity.repository.UserRepository;
import com.xpay.core.modules.transaction.entity.Transaction;
import com.xpay.core.modules.transaction.repository.TransactionRepository;
import com.xpay.core.modules.wallet.entity.Wallet;
import com.xpay.core.modules.wallet.entity.WalletStatus;
import com.xpay.core.modules.wallet.repository.WalletRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.text.NumberFormat;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Locale;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class AdminServiceImpl implements AdminService {

    private final UserRepository userRepository;
    private final WalletRepository walletRepository;
    private final TransactionRepository transactionRepository;

    private static final DateTimeFormatter FORMATTER =
            DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss");

    private String formatVnd(BigDecimal amount) {
        if (amount == null) return "0 VND";
        NumberFormat nf = NumberFormat.getNumberInstance(new Locale("vi", "VN"));
        return nf.format(amount) + " VND";
    }

    // ─── Dashboard Stats ──────────────────────────────────────────────────────

    @Override
    public AdminDashboardStats getDashboardStats() {
        long totalUsers        = userRepository.count();
        long totalWallets      = walletRepository.count();
        BigDecimal totalBal    = walletRepository.sumTotalBalance();
        long totalTx           = transactionRepository.count();
        long pendingKyc        = userRepository.countByKycStatus(KycStatus.UNVERIFIED);
        long lockedWallets     = walletRepository.countByStatus(WalletStatus.LOCKED);

        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        LocalDateTime endOfDay   = startOfDay.plusDays(1);
        long todayTx = transactionRepository.countByCreatedAtBetween(startOfDay, endOfDay);

        return AdminDashboardStats.builder()
                .totalUsers(totalUsers)
                .totalWallets(totalWallets)
                .totalSystemBalance(formatVnd(totalBal))
                .totalTransactions(totalTx)
                .todayTransactions(todayTx)
                .pendingKycCount(pendingKyc)
                .lockedWallets(lockedWallets)
                .build();
    }

    // ─── User Management ─────────────────────────────────────────────────────

    @Override
    public PageResponse<AdminUserResponse> getAllUsers(Pageable pageable) {
        Page<User> page = userRepository.findAll(pageable);
        Page<AdminUserResponse> mapped = page.map(user -> {
            Wallet wallet = walletRepository.findByUserId(user.getId()).orElse(null);
            return buildUserResponse(user, wallet);
        });
        return PageResponse.of(mapped);
    }

    @Override
    @Transactional
    public AdminUserResponse approveKyc(String userId) {
        User user = findUser(userId);
        user.setKycStatus(KycStatus.VERIFIED);
        userRepository.save(user);
        log.info("[ADMIN] Approved KYC for user: {}", user.getUsername());
        Wallet wallet = walletRepository.findByUserId(user.getId()).orElse(null);
        return buildUserResponse(user, wallet);
    }

    @Override
    @Transactional
    public AdminUserResponse rejectKyc(String userId) {
        User user = findUser(userId);
        user.setKycStatus(KycStatus.REJECTED);
        userRepository.save(user);
        log.info("[ADMIN] Rejected KYC for user: {}", user.getUsername());
        Wallet wallet = walletRepository.findByUserId(user.getId()).orElse(null);
        return buildUserResponse(user, wallet);
    }

    @Override
    @Transactional
    public AdminUserResponse toggleWalletLock(String userId) {
        User user = findUser(userId);
        Wallet wallet = walletRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy ví của user: " + userId));

        WalletStatus newStatus = wallet.getStatus() == WalletStatus.ACTIVE
                ? WalletStatus.LOCKED
                : WalletStatus.ACTIVE;
        wallet.setStatus(newStatus);
        walletRepository.save(wallet);
        log.info("[ADMIN] Toggled wallet status to {} for user: {}", newStatus, user.getUsername());
        return buildUserResponse(user, wallet);
    }

    // ─── Transaction Logs ────────────────────────────────────────────────────

    @Override
    public PageResponse<AdminTransactionResponse> getAllTransactions(Pageable pageable) {
        Page<Transaction> page = transactionRepository.findAllByOrderByCreatedAtDesc(pageable);
        Page<AdminTransactionResponse> mapped = page.map(this::buildTxResponse);
        return PageResponse.of(mapped);
    }

    // ─── Helpers ─────────────────────────────────────────────────────────────

    private User findUser(String userId) {
        return userRepository.findById(UUID.fromString(userId))
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy user: " + userId));
    }

    private AdminUserResponse buildUserResponse(User user, Wallet wallet) {
        return AdminUserResponse.builder()
                .userId(user.getId().toString())
                .username(user.getUsername())
                .email(user.getEmail())
                .role(user.getRole().name())
                .kycStatus(user.getKycStatus().name())
                .walletId(wallet != null ? wallet.getId().toString() : null)
                .walletBalance(wallet != null ? formatVnd(wallet.getBalance()) : "N/A")
                .walletStatus(wallet != null ? wallet.getStatus().name() : "N/A")
                .createdAt(user.getCreatedAt() != null
                        ? user.getCreatedAt().format(FORMATTER) : null)
                .build();
    }

    private AdminTransactionResponse buildTxResponse(Transaction tx) {
        String sender = tx.getSourceWallet() != null
                ? tx.getSourceWallet().getUser().getUsername() : "SYSTEM";
        String receiver = tx.getDestinationWallet() != null
                ? tx.getDestinationWallet().getUser().getUsername() : "N/A";

        return AdminTransactionResponse.builder()
                .transactionId(tx.getId().toString())
                .type(tx.getType().name())
                .status(tx.getStatus().name())
                .amount(formatVnd(tx.getAmount()))
                .senderUsername(sender)
                .receiverUsername(receiver)
                .referenceNote(tx.getReferenceNote())
                .createdAt(tx.getCreatedAt() != null
                        ? tx.getCreatedAt().format(FORMATTER) : null)
                .build();
    }
}

