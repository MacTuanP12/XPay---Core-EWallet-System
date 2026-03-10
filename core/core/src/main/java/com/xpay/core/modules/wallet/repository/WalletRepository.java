package com.xpay.core.modules.wallet.repository;

import com.xpay.core.modules.wallet.entity.Wallet;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface WalletRepository extends JpaRepository<Wallet, UUID> {

    Optional<Wallet> findByUserId(UUID userId);

    // Pessimistic Write Lock: SELECT ... FOR UPDATE
    // Khi 1 transaction đang giữ lock, transaction khác PHẢI ĐỢI
    // → Chống race condition khi 2 request chuyển tiền đến cùng 1 ví đồng thời
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT w FROM Wallet w WHERE w.id = :id")
    Optional<Wallet> findByIdWithLock(@Param("id") UUID id);
}

